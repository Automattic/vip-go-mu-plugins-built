package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"sync/atomic"
	"syscall"
	"time"
)

type siteInfo struct {
	Multisite int
	Siteurl   string
	Disabled  int
}

type site struct {
	URL string
}

type event struct {
	URL       string
	Timestamp int
	Action    string
	Instance  string
}

var (
	wpCliPath string
	wpNetwork int
	wpPath    string

	numGetWorkers int
	numRunWorkers int

	getEventsInterval int

	heartbeatInt int

	disabledLoopCount    uint64
	eventRunErrCount     uint64
	eventRunSuccessCount uint64

	logger  *log.Logger
	logDest string
	debug   bool
)

const getEventsBreak time.Duration = time.Second
const runEventsBreak time.Duration = time.Second * 10

func init() {
	flag.StringVar(&wpCliPath, "cli", "/usr/local/bin/wp", "Path to WP-CLI binary")
	flag.IntVar(&wpNetwork, "network", 0, "WordPress network ID, `0` to disable")
	flag.StringVar(&wpPath, "wp", "/var/www/html", "Path to WordPress installation")
	flag.IntVar(&numGetWorkers, "workers-get", 1, "Number of workers to retrieve events")
	flag.IntVar(&numRunWorkers, "workers-run", 5, "Number of workers to run events")
	flag.IntVar(&getEventsInterval, "get-events-interval", 60, "Seconds between event retrieval")
	flag.IntVar(&heartbeatInt, "heartbeat", 60, "Heartbeat interval in seconds")
	flag.StringVar(&logDest, "log", "os.Stdout", "Log path, omit to log to Stdout")
	flag.BoolVar(&debug, "debug", false, "Include additional log data for debugging")
	flag.Parse()

	setUpLogger()

	// TODO: Should check for wp-config.php instead?
	validatePath(&wpCliPath, "WP-CLI path")
	validatePath(&wpPath, "WordPress path")
}

func main() {
	logger.Printf("Starting with %d event-retreival worker(s) and %d event worker(s)", numGetWorkers, numRunWorkers)
	logger.Printf("Retrieving events every %d seconds", getEventsInterval)
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)

	sites := make(chan site)
	events := make(chan event)

	go spawnEventRetrievers(sites, events)
	go spawnEventWorkers(events)
	go retrieveSitesPeriodically(sites)
	go heartbeat()

	caughtSig := <-sig
	logger.Printf("Stopping, got signal %s", caughtSig)
}

func spawnEventRetrievers(sites <-chan site, queue chan<- event) {
	for w := 1; w <= numGetWorkers; w++ {
		go queueSiteEvents(w, sites, queue)
	}
}

func spawnEventWorkers(queue <-chan event) {
	workerEvents := make(chan event)

	for w := 1; w <= numRunWorkers; w++ {
		go runEvents(w, workerEvents)
	}

	for event := range queue {
		workerEvents <- event
	}

	close(workerEvents)
}

func retrieveSitesPeriodically(sites chan<- site) {
	loopInterval := time.Duration(getEventsInterval) * time.Second

	for range time.Tick(loopInterval) {
		siteList, err := getSites()
		if err != nil {
			continue
		}

		for _, site := range siteList {
			sites <- site
		}
	}
}

func heartbeat() {
	if heartbeatInt == 0 {
		logger.Println("heartbeat disabled")
		return
	}

	interval := time.Duration(heartbeatInt) * time.Second

	for range time.Tick(interval) {
		successCount, errCount := atomic.LoadUint64(&eventRunSuccessCount), atomic.LoadUint64(&eventRunErrCount)
		atomic.SwapUint64(&eventRunSuccessCount, 0)
		atomic.SwapUint64(&eventRunErrCount, 0)
		logger.Printf("<heartbeat eventsSucceededSinceLast=%d eventsErroredSinceLast=%d>", successCount, errCount)
	}
}

func getSites() ([]site, error) {
	siteInfo, err := getInstanceInfo()
	if err != nil {
		siteInfo.Disabled = 1
	}

	if run := shouldGetSites(siteInfo.Disabled); false == run {
		return nil, err
	}

	if siteInfo.Multisite == 1 {
		sites, err := getMultisiteSites()
		if err != nil {
			sites = nil
		}

		return sites, err
	}

	// Mock for single site
	sites := make([]site, 0)
	sites = append(sites, site{URL: siteInfo.Siteurl})

	return sites, nil
}

func getInstanceInfo() (siteInfo, error) {
	raw, err := runWpCliCmd([]string{"cron-control", "orchestrate", "runner-only", "get-info", "--format=json"})
	if err != nil {
		return siteInfo{}, err
	}

	jsonRes := make([]siteInfo, 0)
	if err = json.Unmarshal([]byte(raw), &jsonRes); err != nil {
		if debug {
			logger.Println(fmt.Sprintf("%+v", err))
		}

		return siteInfo{}, err
	}

	return jsonRes[0], nil
}

func shouldGetSites(disabled int) bool {
	if disabled == 0 {
		atomic.SwapUint64(&disabledLoopCount, 0)
		return true
	}

	disabledCount, now := atomic.LoadUint64(&disabledLoopCount), time.Now()
	disabledSleep := time.Minute * 3 * time.Duration(disabledCount)
	disabledSleepSeconds := int64(disabledSleep) / 1000 / 1000 / 1000

	if disabled > 1 && (now.Unix()+disabledSleepSeconds) > int64(disabled) {
		atomic.SwapUint64(&disabledLoopCount, 0)
	} else if disabledSleep > time.Hour {
		atomic.SwapUint64(&disabledLoopCount, 0)
	} else {
		atomic.AddUint64(&disabledLoopCount, 1)
	}

	if disabledSleep > 0 {
		if debug {
			logger.Printf("Automatic execution disabled, sleeping for an additional %d minutes", disabledSleepSeconds/60)
		}

		time.Sleep(disabledSleep)
	} else if debug {
		logger.Println("Automatic execution disabled")
	}

	return false
}

func getMultisiteSites() ([]site, error) {
	raw, err := runWpCliCmd([]string{"site", "list", "--fields=url", "--archived=false", "--deleted=false", "--spam=false", "--format=json"})
	if err != nil {
		return nil, err
	}

	jsonRes := make([]site, 0)
	if err = json.Unmarshal([]byte(raw), &jsonRes); err != nil {
		if debug {
			logger.Println(fmt.Sprintf("%+v", err))
		}

		return nil, err
	}

	// Shuffle site order so that none are favored
	for i := range jsonRes {
		j := rand.Intn(i + 1)
		jsonRes[i], jsonRes[j] = jsonRes[j], jsonRes[i]
	}

	return jsonRes, nil
}

func queueSiteEvents(workerID int, sites <-chan site, queue chan<- event) {
	for site := range sites {
		if debug {
			logger.Printf("getEvents-%d processing %s", workerID, site.URL)
		}

		events, err := getSiteEvents(site.URL)
		if err != nil {
			time.Sleep(getEventsBreak)
			continue
		}

		for _, event := range events {
			event.URL = site.URL
			queue <- event
		}

		time.Sleep(getEventsBreak)
	}
}

func getSiteEvents(site string) ([]event, error) {
	raw, err := runWpCliCmd([]string{"cron-control", "orchestrate", "runner-only", "list-due-batch", fmt.Sprintf("--url=%s", site), "--format=json"})
	if err != nil {
		return nil, err
	}

	siteEvents := make([]event, 0)
	if err = json.Unmarshal([]byte(raw), &siteEvents); err != nil {
		if debug {
			logger.Println(fmt.Sprintf("%+v", err))
		}

		return nil, err
	}

	return siteEvents, nil
}

func runEvents(workerID int, events <-chan event) {
	for event := range events {
		if now := time.Now(); event.Timestamp > int(now.Unix()) {
			if debug {
				logger.Printf("runEvents-%d skipping premature job %d|%s|%s for %s", workerID, event.Timestamp, event.Action, event.Instance, event.URL)
			}

			continue
		}

		subcommand := []string{"cron-control", "orchestrate", "runner-only", "run", fmt.Sprintf("--timestamp=%d", event.Timestamp), fmt.Sprintf("--action=%s", event.Action), fmt.Sprintf("--instance=%s", event.Instance), fmt.Sprintf("--url=%s", event.URL)}

		_, err := runWpCliCmd(subcommand)

		if err == nil {
			if heartbeatInt > 0 {
				atomic.AddUint64(&eventRunSuccessCount, 1)
			}

			if debug {
				logger.Printf("runEvents-%d finished job %d|%s|%s for %s", workerID, event.Timestamp, event.Action, event.Instance, event.URL)
			}
		} else if heartbeatInt > 0 {
			atomic.AddUint64(&eventRunErrCount, 1)
		}

		time.Sleep(runEventsBreak)
	}
}

func runWpCliCmd(subcommand []string) (string, error) {
	// `--quiet`` included to prevent WP-CLI commands from generating invalid JSON
	subcommand = append(subcommand, "--allow-root", "--quiet", fmt.Sprintf("--path=%s", wpPath))
	if wpNetwork > 0 {
		subcommand = append(subcommand, fmt.Sprintf("--network=%d", wpNetwork))
	}

	wpCli := exec.Command(wpCliPath, subcommand...)
	wpOut, err := wpCli.CombinedOutput()
	wpOutStr := string(wpOut)

	if err != nil {
		if debug {
			logger.Printf("%s - %s", err, wpOutStr)
			logger.Println(fmt.Sprintf("%+v", subcommand))
		}

		return wpOutStr, err
	}

	return wpOutStr, nil
}

func setUpLogger() {
	logOpts := log.Ldate | log.Ltime | log.LUTC | log.Lshortfile

	if logDest == "os.Stdout" {
		logger = log.New(os.Stdout, "DEBUG: ", logOpts)
	} else {
		path, err := filepath.Abs(logDest)
		if err != nil {
			logger.Fatal(err)
		}

		logFile, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0644)
		if err != nil {
			log.Fatal(err)
		}

		logger = log.New(logFile, "", logOpts)
	}
}

func validatePath(path *string, label string) {
	if len(*path) > 1 {
		var err error
		*path, err = filepath.Abs(*path)

		if err != nil {
			fmt.Printf("Error for %s: %s\n", label, err.Error())
			os.Exit(3)
		}

		if _, err = os.Stat(*path); os.IsNotExist(err) {
			fmt.Printf("Error for %s: '%s' does not exist\n", label, *path)
			usage()
		}
	} else {
		fmt.Printf("Empty path provided for %s\n", label)
		usage()
	}
}

func usage() {
	flag.Usage()
	os.Exit(3)
}
