# download github.com/automattic/vip-go-mu-plugins zip and extract it to the mu-plugins folder
if [ ! -d "mu-plugins" ]; then
	repo_url="https://github.com/Automattic/vip-go-mu-plugins-built/archive/refs/heads/master.zip"

	echo "Downloading repository from $repo_url..."
	curl -sL $repo_url -o mu-plugins.zip

	# Check if download was successful
	if [ $? -ne 0 ]; then
		echo "Failed to download repository. Exiting..."
		exit 1
	fi

	# Extract the downloaded zip file
	echo "Extracting repository"
	unzip -o -q mu-plugins.zip

	mv "vip-go-mu-plugins-built-master" "mu-plugins"

	# Cleanup: Remove the temporary zip file
	rm mu-plugins.zip
else
	echo "mu-plugins directory already exists. Skipping download."
fi
