/**
 * Handsontable 0.7.0-beta
 * Handsontable is a simple jQuery plugin for editable tables with basic copy-paste compatibility with Excel and Google Docs
 *
 * Copyright 2012, Marcin Warpechowski
 * Licensed under the MIT license.
 * http://warpech.github.com/jquery-handsontable/
 */
/*jslint white: true, browser: true, plusplus: true, indent: 4, maxerr: 50 */

var Handsontable = { //class namespace
  extension: {}, //extenstion namespace
  helper: {} //helper namespace
};

(function ($, window, Handsontable) {
  "use strict";
/**
 * Handsontable constructor
 * @param rootElement The jQuery element in which Handsontable DOM will be inserted
 * @param settings
 * @constructor
 */
Handsontable.Core = function (rootElement, settings) {
  this.rootElement = rootElement;

  var priv, datamap, grid, selection, editproxy, highlight, autofill, self = this;

  priv = {
    settings: {},
    selStart: null,
    selEnd: null,
    editProxy: false,
    isPopulated: null,
    scrollable: null,
    undoRedo: null,
    extensions: {},
    colToProp: [],
    propToCol: {},
    dataSchema: null,
    dataType: 'array'
  };

  var hasMinWidthProblem = ($.browser.msie && (parseInt($.browser.version, 10) <= 7));
  /**
   * Used to get over IE7 not respecting CSS min-width (and also not showing border around empty cells)
   * @param {Element} td
   */
  this.minWidthFix = function (td) {
    if (hasMinWidthProblem) {
      if (td.className) {
        td.innerHTML = '<div class="minWidthFix ' + td.className + '">' + td.innerHTML + '</div>';
      }
      else {
        td.innerHTML = '<div class="minWidthFix">' + td.innerHTML + '</div>';
      }
    }
  };

  var hasPositionProblem = ($.browser.msie && (parseInt($.browser.version, 10) <= 7));
  /**
   * Used to get over IE7 returning negative position in demo/buttons.html
   * @param {Object} position
   */
  this.positionFix = function (position) {
    if (hasPositionProblem) {
      if (position.top < 0) {
        position.top = 0;
      }
      if (position.left < 0) {
        position.left = 0;
      }
    }
  };

  /**
   * This will parse a delimited string into an array of arrays. The default delimiter is the comma, but this can be overriden in the second argument.
   * @see http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
   * @param strData
   * @param strDelimiter
   */
  var strDelimiter = '\t';
  var objPattern = new RegExp("(\\" + strDelimiter + "|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\"\\" + strDelimiter + "\\r\\n]*))", "gi");
  var dblQuotePattern = /""/g;

  function CSVToArray(strData) {
    var rows;
    if (strData.indexOf('"') === -1) { //if there is no " symbol, we don't have to use regexp to parse the input
      var r, rlen;
      rows = strData.split("\n");
      if (rows.length > 1 && rows[rows.length - 1] === '') {
        rows.pop();
      }
      for (r = 0, rlen = rows.length; r < rlen; r++) {
        rows[r] = rows[r].split("\t");
      }
    }
    else {
      rows = [
        []
      ];
      var arrMatches, strMatchedValue;
      while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[ 1 ];
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
          rows.push([]);
        }
        if (arrMatches[2]) {
          strMatchedValue = arrMatches[2].replace(dblQuotePattern, '"');
        }
        else {
          strMatchedValue = arrMatches[3];
        }
        rows[rows.length - 1].push(strMatchedValue);
      }
    }
    return rows;
  }

  datamap = {
    recursiveDuckSchema: function (obj) {
      var schema;
      if (Object.prototype.toString.call(obj) === '[object Object]') {
        schema = {};
        for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
            if (Object.prototype.toString.call(obj[i]) === '[object Object]') {
              schema[i] = datamap.recursiveDuckSchema(obj[i]);
            }
            else {
              schema[i] = null;
            }
          }
        }
      }
      else {
        schema = [];
      }
      return schema;
    },

    recursiveDuckColumns: function (schema, lastCol, parent) {
      var prop, i;
      if (typeof lastCol === 'undefined') {
        lastCol = 0;
        parent = '';
      }
      if (Object.prototype.toString.call(schema) === '[object Object]') {
        for (i in schema) {
          if (schema.hasOwnProperty(i)) {
            if (schema[i] === null) {
              prop = parent + i;
              priv.colToProp.push(prop);
              priv.propToCol[prop] = lastCol;
              lastCol++;
            }
            else {
              lastCol = datamap.recursiveDuckColumns(schema[i], lastCol, i + '.');
            }
          }
        }
      }
      return lastCol;
    },

    createMap: function () {
      if (typeof datamap.getSchema() === "undefined") {
        throw new Error("trying to create `columns` definition but you didnt' provide `schema` nor `data`");
      }
      var i, ilen, schema = datamap.getSchema();
      priv.colToProp = [];
      priv.propToCol = {};
      if (priv.settings.columns) {
        for (i = 0, ilen = priv.settings.columns.length; i < ilen; i++) {
          priv.colToProp[i] = priv.settings.columns[i].data;
          priv.propToCol[priv.settings.columns[i].data] = i;
        }
      }
      else {
        datamap.recursiveDuckColumns(schema);
      }
    },

    colToProp: function (col) {
      if (typeof priv.colToProp[col] !== 'undefined') {
        return priv.colToProp[col];
      }
      else {
        return col;
      }
    },

    propToCol: function (prop) {
      if (typeof priv.propToCol[prop] !== 'undefined') {
        return priv.propToCol[prop];
      }
      else {
        return prop;
      }

    },

    getSchema: function () {
      return priv.settings.dataSchema || priv.duckDataSchema;
    },

    /**
     * Creates row at the bottom of the data array
     * @param {Object} [coords] Optional. Coords of the cell before which the new row will be inserted
     */
    createRow: function (coords) {
      var row;
      if (priv.dataType === 'array') {
        row = [];
        for (var c = 0; c < self.colCount; c++) {
          row.push(null);
        }
      }
      else {
        row = $.extend(true, {}, datamap.getSchema());
      }
      if (!coords || coords.row >= self.rowCount) {
        priv.settings.data.push(row);
      }
      else {
        priv.settings.data.splice(coords.row, 0, row);
      }
    },

    /**
     * Creates col at the right of the data array
     * @param {Object} [coords] Optional. Coords of the cell before which the new column will be inserted
     */
    createCol: function (coords) {
      if (priv.dataType === 'object' || priv.settings.columns) {
        throw new Error("cannot create column with object data source or columns option specified");
      }
      var r = 0;
      if (!coords || coords.col >= self.colCount) {
        for (; r < self.rowCount; r++) {
          if (typeof priv.settings.data[r] === 'undefined') {
            priv.settings.data[r] = [];
          }
          priv.settings.data[r].push('');
        }
      }
      else {
        for (; r < self.rowCount; r++) {
          priv.settings.data[r].splice(coords.col, 0, '');
        }
      }
    },

    /**
     * Removes row at the bottom of the data array
     * @param {Object} [coords] Optional. Coords of the cell which row will be removed
     * @param {Object} [toCoords] Required if coords is defined. Coords of the cell until which all rows will be removed
     */
    removeRow: function (coords, toCoords) {
      if (!coords || coords.row === self.rowCount - 1) {
        priv.settings.data.pop();
      }
      else {
        priv.settings.data.splice(coords.row, toCoords.row - coords.row + 1);
      }
    },

    /**
     * Removes col at the right of the data array
     * @param {Object} [coords] Optional. Coords of the cell which col will be removed
     * @param {Object} [toCoords] Required if coords is defined. Coords of the cell until which all cols will be removed
     */
    removeCol: function (coords, toCoords) {
      if (priv.dataType === 'object' || priv.settings.columns) {
        throw new Error("cannot remove column with object data source or columns option specified");
      }
      var r = 0;
      if (!coords || coords.col === self.colCount - 1) {
        for (; r < self.rowCount; r++) {
          priv.settings.data[r].pop();
        }
      }
      else {
        var howMany = toCoords.col - coords.col + 1;
        for (; r < self.rowCount; r++) {
          priv.settings.data[r].splice(coords.col, howMany);
        }
      }
    },

    /**
     * Returns single value from the data array
     * @param {Number} row
     * @param {Number} prop
     */
    get: function (row, prop) {
      if (typeof prop === 'string' && prop.indexOf('.') > -1) {
        var sliced = prop.split(".");
        var out = priv.settings.data[row];
        for (var i = 0, ilen = sliced.length; i < ilen; i++) {
          out = out[sliced[i]];
          if (typeof out === 'undefined') {
            return null;
          }
        }
        return out;
      }
      else {
        return priv.settings.data[row] ? priv.settings.data[row][prop] : null;
      }
    },

    /**
     * Saves single value to the data array
     * @param {Number} row
     * @param {Number} prop
     * @param {String} value
     */
    set: function (row, prop, value) {
      if (typeof prop === 'string' && prop.indexOf('.') > -1) {
        var sliced = prop.split(".");
        var out = priv.settings.data[row];
        for (var i = 0, ilen = sliced.length - 1; i < ilen; i++) {
          out = out[sliced[i]];
        }
        out[sliced[i]] = value;
      }
      else {
        priv.settings.data[row][prop] = value;
      }
    },

    /**
     * Clears the data array
     */
    clear: function () {
      for (var r = 0; r < self.rowCount; r++) {
        for (var c = 0; c < self.colCount; c++) {
          datamap.set(r, datamap.colToProp(c), '');
        }
      }
    },

    /**
     * Returns the data array
     * @return {Array}
     */
    getAll: function () {
      return priv.settings.data;
    },

    /**
     * Returns data range as array
     * @param {Object} start Start selection position
     * @param {Object} end End selection position
     * @return {Array}
     */
    getRange: function (start, end) {
      var r, rlen, c, clen, output = [], row;
      rlen = Math.max(start.row, end.row);
      clen = Math.max(start.col, end.col);
      for (r = Math.min(start.row, end.row); r <= rlen; r++) {
        row = [];
        for (c = Math.min(start.col, end.col); c <= clen; c++) {
          row.push(datamap.get(r, datamap.colToProp(c)));
        }
        output.push(row);
      }
      return output;
    },

    /**
     * Return data as text (tab separated columns)
     * @param {Object} start (Optional) Start selection position
     * @param {Object} end (Optional) End selection position
     * @return {String}
     */
    getText: function (start, end) {
      var data = datamap.getRange(start, end), text = '', r, rlen, c, clen, val;
      for (r = 0, rlen = data.length; r < rlen; r++) {
        for (c = 0, clen = data[r].length; c < clen; c++) {
          if (c > 0) {
            text += "\t";
          }
          val = data[r][c];
          if (typeof val === 'string') {
            if (val.indexOf('\n') > -1) {
              text += '"' + val.replace(/"/g, '""') + '"';
            }
            else {
              text += val;
            }
          }
          else if (val == null || typeof val === 'undefined') {
            text += '';
          }
          else {
            text += val;
          }
        }
        text += "\n";
      }
      return text;
    }
  };

  grid = {
    /**
     * Alter grid
     * @param {String} action Possible values: "insert_row", "insert_col", "remove_row", "remove_col"
     * @param {Object} coords
     * @param {Object} [toCoords] Required only for actions "remove_row" and "remove_col"
     */
    alter: function (action, coords, toCoords) {
      var oldData, newData, changes, r, rlen, c, clen, result;
      oldData = $.extend(true, [], datamap.getAll());

      switch (action) {
        case "insert_row":
          datamap.createRow(coords);
          self.view.createRow(coords);
          self.blockedCols.refresh();
          if (priv.selStart && priv.selStart.row >= coords.row) {
            priv.selStart.row = priv.selStart.row + 1;
            selection.transformEnd(1, 0);
          }
          else {
            selection.transformEnd(0, 0); //refresh selection, otherwise arrow movement does not work
          }
          break;

        case "insert_col":
          datamap.createCol(coords);
          self.view.createCol(coords);
          self.blockedRows.refresh();
          if (priv.selStart && priv.selStart.col >= coords.col) {
            priv.selStart.col = priv.selStart.col + 1;
            selection.transformEnd(0, 1);
          }
          else {
            selection.transformEnd(0, 0); //refresh selection, otherwise arrow movement does not work
          }
          break;

        case "remove_row":
          datamap.removeRow(coords, toCoords);
          self.view.removeRow(coords, toCoords);
          result = grid.keepEmptyRows();
          if (!result) {
            self.blockedCols.refresh();
          }
          selection.transformEnd(0, 0); //refresh selection, otherwise arrow movement does not work
          break;

        case "remove_col":
          datamap.removeCol(coords, toCoords);
          self.view.removeCol(coords, toCoords);
          result = grid.keepEmptyRows();
          if (!result) {
            self.blockedRows.refresh();
          }
          selection.transformEnd(0, 0); //refresh selection, otherwise arrow movement does not work
          break;
      }

      changes = [];
      newData = datamap.getAll();
      for (r = 0, rlen = newData.length; r < rlen; r++) {
        for (c = 0, clen = newData[r].length; c < clen; c++) {
          changes.push([r, c, oldData[r] ? oldData[r][c] : null, newData[r][c]]);
        }
      }
      self.rootElement.triggerHandler("datachange.handsontable", [changes, 'alter']);
    },

    /**
     * Makes sure there are empty rows at the bottom of the table
     * @return recreate {Boolean} TRUE if row or col was added or removed
     */
    keepEmptyRows: function () {
      var r, c, rlen, clen, emptyRows = 0, emptyCols = 0, recreateRows = false, recreateCols = false, val;

      var $tbody = $(priv.tableBody);

      //count currently empty rows
      rows : for (r = self.rowCount - 1; r >= 0; r--) {
        for (c = 0, clen = self.colCount; c < clen; c++) {
          val = datamap.get(r, datamap.colToProp(c));
          if (val !== '' && val !== null && typeof val !== 'undefined') {
            break rows;
          }
        }
        emptyRows++;
      }

      //should I add empty rows to data source to meet startRows?
      rlen = priv.settings.data.length;
      if (rlen < priv.settings.startRows) {
        for (r = 0; r < priv.settings.startRows - rlen; r++) {
          datamap.createRow();
        }
      }

      //should I add empty rows to table view to meet startRows?
      if (self.rowCount < priv.settings.startRows) {
        for (; self.rowCount < priv.settings.startRows; emptyRows++) {
          self.view.createRow();
          recreateRows = true;
        }
      }

      //should I add empty rows to meet minSpareRows?
      if (emptyRows < priv.settings.minSpareRows) {
        for (; emptyRows < priv.settings.minSpareRows; emptyRows++) {
          datamap.createRow();
          self.view.createRow();
          recreateRows = true;
        }
      }

      //should I add empty rows to meet minHeight
      //WARNING! jQuery returns 0 as height() for container which is not :visible. this will lead to a infinite loop
      if (priv.settings.minHeight) {
        if ($tbody.height() > 0 && $tbody.height() <= priv.settings.minHeight) {
          while ($tbody.height() <= priv.settings.minHeight) {
            datamap.createRow();
            self.view.createRow();
            recreateRows = true;
          }
        }
      }

      //count currently empty cols
      if (self.rowCount - 1 > 0) {
        cols : for (c = self.colCount - 1; c >= 0; c--) {
          for (r = 0; r < self.rowCount; r++) {
            val = datamap.get(r, datamap.colToProp(c));
            if (val !== '' && val !== null && typeof val !== 'undefined') {
              break cols;
            }
          }
          emptyCols++;
        }
      }

      //should I add empty cols to meet startCols?
      if (self.colCount < priv.settings.startCols) {
        for (; self.colCount < priv.settings.startCols; emptyCols++) {
          if (!priv.settings.columns) {
            datamap.createCol();
          }
          self.view.createCol();
          recreateCols = true;
        }
      }

      //should I add empty cols to meet minSpareCols?
      if (priv.dataType === 'array' && emptyCols < priv.settings.minSpareCols) {
        for (; emptyCols < priv.settings.minSpareCols; emptyCols++) {
          if (!priv.settings.columns) {
            datamap.createCol();
          }
          self.view.createCol();
          recreateCols = true;
        }
      }

      //should I add empty rows to meet minWidth
      //WARNING! jQuery returns 0 as width() for container which is not :visible. this will lead to a infinite loop
      if (priv.settings.minWidth) {
        if ($tbody.width() > 0 && $tbody.width() <= priv.settings.minWidth) {
          while ($tbody.width() <= priv.settings.minWidth) {
            if (!priv.settings.columns) {
              datamap.createCol();
            }
            self.view.createCol();
            recreateCols = true;
          }
        }
      }

      if (!recreateRows && priv.settings.enterBeginsEditing) {
        for (; ((priv.settings.startRows && self.rowCount > priv.settings.startRows) && (priv.settings.minSpareRows && emptyRows > priv.settings.minSpareRows) && (!priv.settings.minHeight || $tbody.height() - $tbody.find('tr:last').height() - 4 > priv.settings.minHeight)); emptyRows--) {
          self.view.removeRow();
          datamap.removeRow();
          recreateRows = true;
        }
      }

      if (recreateRows && priv.selStart) {
        //if selection is outside, move selection to last row
        if (priv.selStart.row > self.rowCount - 1) {
          priv.selStart.row = self.rowCount - 1;
          if (priv.selEnd.row > priv.selStart.row) {
            priv.selEnd.row = priv.selStart.row;
          }
        } else if (priv.selEnd.row > self.rowCount - 1) {
          priv.selEnd.row = self.rowCount - 1;
          if (priv.selStart.row > priv.selEnd.row) {
            priv.selStart.row = priv.selEnd.row;
          }
        }
      }

      if (priv.settings.columns && priv.settings.columns.length) {
        clen = priv.settings.columns.length;
        if (self.colCount !== clen) {
          while (self.colCount > clen) {
            self.view.removeCol();
          }
          while (self.colCount < clen) {
            self.view.createCol();
          }
          recreateCols = true;
        }
      }
      else if (!recreateCols && priv.settings.enterBeginsEditing) {
        for (; ((priv.settings.startCols && self.colCount > priv.settings.startCols) && (priv.settings.minSpareCols && emptyCols > priv.settings.minSpareCols) && (!priv.settings.minWidth || $tbody.width() - $tbody.find('tr:last').find('td:last').width() - 4 > priv.settings.minWidth)); emptyCols--) {
          if (!priv.settings.columns) {
            datamap.removeCol();
          }
          self.view.removeCol();
          recreateCols = true;
        }
      }

      if (recreateCols && priv.selStart) {
        //if selection is outside, move selection to last row
        if (priv.selStart.col > self.colCount - 1) {
          priv.selStart.col = self.colCount - 1;
          if (priv.selEnd.col > priv.selStart.col) {
            priv.selEnd.col = priv.selStart.col;
          }
        } else if (priv.selEnd.col > self.colCount - 1) {
          priv.selEnd.col = self.colCount - 1;
          if (priv.selStart.col > priv.selEnd.col) {
            priv.selStart.col = priv.selEnd.col;
          }
        }
      }

      if (recreateRows || recreateCols) {
        selection.refreshBorders();
        self.blockedCols.refresh();
        self.blockedRows.refresh();
      }

      return (recreateRows || recreateCols);
    },

    /**
     * Is cell writable
     */
    isCellWritable: function ($td, cellProperties) {
      if (priv.isPopulated) {
        var data = $td.data('readOnly');
        if (typeof data === 'undefined') {
          return !cellProperties.readOnly;
        }
        else {
          return data;
        }
      }
      return true;
    },

    /**
     * Populate cells at position with 2d array
     * @param {Object} start Start selection position
     * @param {Array} input 2d array
     * @param {Object} [end] End selection position (only for drag-down mode)
     * @param {String} [source="populateFromArray"]
     * @return {Object|undefined} ending td in pasted area (only if any cell was changed)
     */
    populateFromArray: function (start, input, end, source) {
      var r, rlen, c, clen, td, endTd, setData = [], current = {};
      rlen = input.length;
      if (rlen === 0) {
        return false;
      }
      current.row = start.row;
      current.col = start.col;
      for (r = 0; r < rlen; r++) {
        if ((end && current.row > end.row) || (!priv.settings.minSpareRows && current.row > self.rowCount - 1)) {
          break;
        }
        current.col = start.col;
        clen = input[r] ? input[r].length : 0;
        for (c = 0; c < clen; c++) {
          if ((end && current.col > end.col) || (!priv.settings.minSpareCols && current.col > self.colCount - 1)) {
            break;
          }
          td = self.view.getCellAtCoords(current);
          if (self.getCellMeta(current.row, current.col).isWritable) {
            var p = datamap.colToProp(current.col);
            setData.push([current.row, p, input[r][c]]);
          }
          current.col++;
          if (end && c === clen - 1) {
            c = -1;
          }
        }
        current.row++;
        if (end && r === rlen - 1) {
          r = -1;
        }
      }
      endTd = self.setDataAtCell(setData, null, null, source || 'populateFromArray');
      return endTd;
    },

    /**
     * Clears all cells in the grid
     */
    clear: function () {
      var tds = self.view.getAllCells();
      for (var i = 0, ilen = tds.length; i < ilen; i++) {
        $(tds[i]).empty();
        self.minWidthFix(tds[i]);
      }
    },

    /**
     * Returns the top left (TL) and bottom right (BR) selection coordinates
     * @param {Object[]} coordsArr
     * @returns {Object}
     */
    getCornerCoords: function (coordsArr) {
      function mapProp(func, array, prop) {
        function getProp(el) {
          return el[prop];
        }

        if (Array.prototype.map) {
          return func.apply(Math, array.map(getProp));
        }
        return func.apply(Math, $.map(array, getProp));
      }

      return {
        TL: {
          row: mapProp(Math.min, coordsArr, "row"),
          col: mapProp(Math.min, coordsArr, "col")
        },
        BR: {
          row: mapProp(Math.max, coordsArr, "row"),
          col: mapProp(Math.max, coordsArr, "col")
        }
      };
    },

    /**
     * Returns array of td objects given start and end coordinates
     */
    getCellsAtCoords: function (start, end) {
      var corners = grid.getCornerCoords([start, end]);
      var r, c, output = [];
      for (r = corners.TL.row; r <= corners.BR.row; r++) {
        for (c = corners.TL.col; c <= corners.BR.col; c++) {
          output.push(self.view.getCellAtCoords({
            row: r,
            col: c
          }));
        }
      }
      return output;
    }
  };

  this.selection = selection = { //this public assignment is only temporary
    /**
     * Starts selection range on given td object
     * @param td element
     */
    setRangeStart: function (td) {
      selection.deselect();
      priv.selStart = self.view.getCellCoords(td);
      selection.setRangeEnd(td);
    },

    /**
     * Ends selection range on given td object
     * @param {Element} td
     * @param {Boolean} [scrollToCell=true] If true, viewport will be scrolled to range end
     */
    setRangeEnd: function (td, scrollToCell) {
      var coords = self.view.getCellCoords(td);
      selection.end(coords);
      if (!priv.settings.multiSelect) {
        priv.selStart = coords;
      }
      self.rootElement.triggerHandler("selection.handsontable", [priv.selStart.row, priv.selStart.col, priv.selEnd.row, priv.selEnd.col]);
      self.rootElement.triggerHandler("selectionbyprop.handsontable", [priv.selStart.row, datamap.colToProp(priv.selStart.col), priv.selEnd.row, datamap.colToProp(priv.selEnd.col)]);
      selection.refreshBorders();
      if (scrollToCell !== false) {
        self.view.scrollViewport(td);
      }
    },

    /**
     * Redraws borders around cells
     */
    refreshBorders: function () {
      editproxy.destroy();
      if (!selection.isSelected()) {
        return;
      }
      if (autofill.handle) {
        autofill.showHandle();
      }
      priv.currentBorder.appear([priv.selStart]);
      highlight.on();
      editproxy.prepare();
    },

    /**
     * Setter/getter for selection start
     */
    start: function (coords) {
      if (typeof coords !== 'undefined') {
        priv.selStart = coords;
      }
      return priv.selStart;
    },

    /**
     * Setter/getter for selection end
     */
    end: function (coords) {
      if (typeof coords !== 'undefined') {
        priv.selEnd = coords;
      }
      return priv.selEnd;
    },

    /**
     * Returns information if we have a multiselection
     * @return {Boolean}
     */
    isMultiple: function () {
      return !(priv.selEnd.col === priv.selStart.col && priv.selEnd.row === priv.selStart.row);
    },

    /**
     * Selects cell relative to current cell (if possible)
     */
    transformStart: function (rowDelta, colDelta, force) {
      if (priv.selStart.row + rowDelta > self.rowCount - 1) {
        if (force && priv.settings.minSpareRows > 0) {
          self.alter("insert_row", self.rowCount);
        }
        else if (priv.settings.autoWrapCol && priv.selStart.col + colDelta < self.colCount - 1) {
          rowDelta = 1 - self.rowCount;
          colDelta = 1;
        }
      }
      else if (priv.settings.autoWrapCol && priv.selStart.row + rowDelta < 0 && priv.selStart.col + colDelta >= 0) {
        rowDelta = self.rowCount - 1;
        colDelta = -1;
      }
      if (priv.selStart.col + colDelta > self.colCount - 1) {
        if (force && priv.settings.minSpareCols > 0) {
          self.alter("insert_col", self.colCount);
        }
        else if (priv.settings.autoWrapRow && priv.selStart.row + rowDelta < self.rowCount - 1) {
          rowDelta = 1;
          colDelta = 1 - self.colCount;
        }
      }
      else if (priv.settings.autoWrapRow && priv.selStart.col + colDelta < 0 && priv.selStart.row + rowDelta >= 0) {
        rowDelta = -1;
        colDelta = self.colCount - 1;
      }
      var td = self.view.getCellAtCoords({
        row: (priv.selStart.row + rowDelta),
        col: priv.selStart.col + colDelta
      });
      if (td) {
        selection.setRangeStart(td);
      }
      else {
        selection.setRangeStart(self.view.getCellAtCoords(priv.selStart)); //rerun some routines
      }
    },

    /**
     * Sets selection end cell relative to current selection end cell (if possible)
     */
    transformEnd: function (rowDelta, colDelta) {
      if (priv.selEnd) {
        var td = self.view.getCellAtCoords({
          row: (priv.selEnd.row + rowDelta),
          col: priv.selEnd.col + colDelta
        });
        if (td) {
          selection.setRangeEnd(td);
        }
      }
    },

    /**
     * Returns true if currently there is a selection on screen, false otherwise
     * @return {Boolean}
     */
    isSelected: function () {
      var selEnd = selection.end();
      if (!selEnd || typeof selEnd.row === "undefined") {
        return false;
      }
      return true;
    },

    /**
     * Returns true if coords is within current selection coords
     * @return {Boolean}
     */
    inInSelection: function (coords) {
      if (!selection.isSelected()) {
        return false;
      }
      var sel = grid.getCornerCoords([priv.selStart, priv.selEnd]);
      return (sel.TL.row <= coords.row && sel.BR.row >= coords.row && sel.TL.col <= coords.col && sel.BR.col >= coords.col);
    },

    /**
     * Deselects all selected cells
     */
    deselect: function () {
      if (!selection.isSelected()) {
        return;
      }
      selection.end(false);
      editproxy.destroy();
      highlight.off();
      priv.currentBorder.disappear();
      if (autofill.handle) {
        autofill.hideHandle();
      }
      self.rootElement.triggerHandler('deselect.handsontable');
    },

    /**
     * Select all cells
     */
    selectAll: function () {
      if (!priv.settings.multiSelect) {
        return;
      }
      var tds = self.view.getAllCells();
      if (tds.length) {
        selection.setRangeStart(tds[0]);
        selection.setRangeEnd(tds[tds.length - 1], false);
      }
    },

    /**
     * Deletes data from selected cells
     */
    empty: function () {
      if (!selection.isSelected()) {
        return;
      }
      var corners = grid.getCornerCoords([priv.selStart, selection.end()]);
      var r, c, changes = [];
      for (r = corners.TL.row; r <= corners.BR.row; r++) {
        for (c = corners.TL.col; c <= corners.BR.col; c++) {
          if (self.getCellMeta(r, c).isWritable) {
            changes.push([r, datamap.colToProp(c), '']);
          }
        }
      }
      self.setDataAtCell(changes);
    }
  };

  highlight = {
    /**
     * Create highlight border
     */
    init: function () {
      priv.selectionBorder = new Handsontable.Border(self, {
        className: 'selection',
        bg: true
      });
    },

    /**
     * Show border around selected cells
     */
    on: function () {
      if (!selection.isSelected()) {
        return false;
      }
      if (selection.isMultiple()) {
        priv.selectionBorder.appear([priv.selStart, selection.end()]);
      }
      else {
        priv.selectionBorder.disappear();
      }
    },

    /**
     * Hide border around selected cells
     */
    off: function () {
      if (!selection.isSelected()) {
        return false;
      }
      priv.selectionBorder.disappear();
    }
  };

  this.autofill = autofill = { //this public assignment is only temporary
    handle: null,
    fillBorder: null,

    /**
     * Create fill handle and fill border objects
     */
    init: function () {
      if (!autofill.handle) {
        autofill.handle = new Handsontable.FillHandle(self);
        autofill.fillBorder = new Handsontable.Border(self, {
          className: 'htFillBorder'
        });

        $(autofill.handle.handle).on('dblclick', autofill.selectAdjacent);
      }
      else {
        autofill.handle.disabled = false;
        autofill.fillBorder.disabled = false;
      }

      self.rootElement.on('beginediting.handsontable', function () {
        autofill.hideHandle();
      });

      self.rootElement.on('finishediting.handsontable', function () {
        if (selection.isSelected()) {
          autofill.showHandle();
        }
      });
    },

    /**
     * Hide fill handle and fill border permanently
     */
    disable: function () {
      autofill.handle.disabled = true;
      autofill.fillBorder.disabled = true;
    },

    /**
     * Selects cells down to the last row in the left column, then fills down to that cell
     */
    selectAdjacent: function () {
      var select, data, r, maxR, c;

      if (selection.isMultiple()) {
        select = priv.selectionBorder.corners;
      }
      else {
        select = priv.currentBorder.corners;
      }

      autofill.fillBorder.disappear();

      data = datamap.getAll();
      rows : for (r = select.BR.row + 1; r < self.rowCount; r++) {
        for (c = select.TL.col; c <= select.BR.col; c++) {
          if (data[r][c]) {
            break rows;
          }
        }
        if (!!data[r][select.TL.col - 1] || !!data[r][select.BR.col + 1]) {
          maxR = r;
        }
      }
      if (maxR) {
        autofill.showBorder(self.view.getCellAtCoords({row: maxR, col: select.BR.col}));
        autofill.apply();
      }
    },

    /**
     * Apply fill values to the area in fill border, omitting the selection border
     */
    apply: function () {
      var drag, select, start, end;

      autofill.handle.isDragged = 0;

      drag = autofill.fillBorder.corners;
      if (!drag) {
        return;
      }

      autofill.fillBorder.disappear();

      if (selection.isMultiple()) {
        select = priv.selectionBorder.corners;
      }
      else {
        select = priv.currentBorder.corners;
      }

      if (drag.TL.row === select.TL.row && drag.TL.col < select.TL.col) {
        start = drag.TL;
        end = {
          row: drag.BR.row,
          col: select.TL.col - 1
        };
      }
      else if (drag.TL.row === select.TL.row && drag.BR.col > select.BR.col) {
        start = {
          row: drag.TL.row,
          col: select.BR.col + 1
        };
        end = drag.BR;
      }
      else if (drag.TL.row < select.TL.row && drag.TL.col === select.TL.col) {
        start = drag.TL;
        end = {
          row: select.TL.row - 1,
          col: drag.BR.col
        };
      }
      else if (drag.BR.row > select.BR.row && drag.TL.col === select.TL.col) {
        start = {
          row: select.BR.row + 1,
          col: drag.TL.col
        };
        end = drag.BR;
      }

      if (start) {
        var inputArray = CSVToArray(priv.editProxy.val(), '\t');
        grid.populateFromArray(start, inputArray, end, 'autofill');

        selection.setRangeStart(self.view.getCellAtCoords(drag.TL));
        selection.setRangeEnd(self.view.getCellAtCoords(drag.BR));
      }
      else {
        //reset to avoid some range bug
        selection.refreshBorders();
      }
    },

    /**
     * Show fill handle
     */
    showHandle: function () {
      autofill.handle.appear([priv.selStart, priv.selEnd]);
    },

    /**
     * Hide fill handle
     */
    hideHandle: function () {
      autofill.handle.disappear();
    },

    /**
     * Show fill border
     */
    showBorder: function (td) {
      var coords = self.view.getCellCoords(td);
      var corners = grid.getCornerCoords([priv.selStart, priv.selEnd]);
      if (priv.settings.fillHandle !== 'horizontal' && (corners.BR.row < coords.row || corners.TL.row > coords.row)) {
        coords = {row: coords.row, col: corners.BR.col};
      }
      else if (priv.settings.fillHandle !== 'vertical') {
        coords = {row: corners.BR.row, col: coords.col};
      }
      else {
        return; //wrong direction
      }
      autofill.fillBorder.appear([priv.selStart, priv.selEnd, coords]);
    }
  };

  this.editproxy = editproxy = { //this public assignment is only temporary
    /**
     * Create input field
     */
    init: function () {
      priv.editProxy = $('<textarea class="handsontableInput">');
      priv.editProxyHolder = $('<div class="handsontableInputHolder">');
      priv.editProxyHolder.append(priv.editProxy);

      function onClick(event) {
        event.stopPropagation();
      }

      function onCut() {
        setTimeout(function () {
          selection.empty();
        }, 100);
      }

      function onPaste() {
        setTimeout(function () {
          var input = priv.editProxy.val().replace(/^[\r\n]*/g, '').replace(/[\r\n]*$/g, ''), //remove newline from the start and the end of the input
            inputArray = CSVToArray(input, '\t'),
            coords = grid.getCornerCoords([priv.selStart, priv.selEnd]),
            endTd = grid.populateFromArray(coords.TL, inputArray, {
              row: Math.max(coords.BR.row, inputArray.length - 1 + coords.TL.row),
              col: Math.max(coords.BR.col, inputArray[0].length - 1 + coords.TL.col)
            }, 'paste');
          if (!endTd) {
            endTd = self.view.getCellAtCoords(coords.BR);
          }
          selection.setRangeEnd(endTd);
        }, 100);
      }

      var $body = $(document.body);

      function onKeyDown(event) {
        if ($body.children('.context-menu-list:visible').length) {
          return;
        }

        var r, c;
        priv.lastKeyCode = event.keyCode;
        if (selection.isSelected()) {
          var ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey; //catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)
          if (Handsontable.helper.isPrintableChar(event.keyCode) && ctrlDown) {
            if (event.keyCode === 65) { //CTRL + A
              selection.selectAll(); //select all cells
            }
            else if (event.keyCode === 88 && $.browser.opera) { //CTRL + X
              priv.editProxy.triggerHandler('cut'); //simulate oncut for Opera
            }
            else if (event.keyCode === 86 && $.browser.opera) { //CTRL + V
              priv.editProxy.triggerHandler('paste'); //simulate onpaste for Opera
            }
            else if (event.keyCode === 89 || (event.shiftKey && event.keyCode === 90)) { //CTRL + Y or CTRL + SHIFT + Z
              priv.undoRedo && priv.undoRedo.redo();
            }
            else if (event.keyCode === 90) { //CTRL + Z
              priv.undoRedo && priv.undoRedo.undo();
            }
            return;
          }

          var rangeModifier = event.shiftKey ? selection.setRangeEnd : selection.setRangeStart;

          switch (event.keyCode) {
            case 38: /* arrow up */
              if (event.shiftKey) {
                selection.transformEnd(-1, 0);
              }
              else {
                selection.transformStart(-1, 0);
              }
              event.preventDefault();
              break;

            case 9: /* tab */
              r = priv.settings.tabMoves.row;
              c = priv.settings.tabMoves.col;
              if (event.shiftKey) {
                selection.transformStart(-r, -c);
              }
              else {
                selection.transformStart(r, c);
              }
              event.preventDefault();
              break;

            case 39: /* arrow right */
              if (event.shiftKey) {
                selection.transformEnd(0, 1);
              }
              else {
                selection.transformStart(0, 1);
              }
              event.preventDefault();
              break;

            case 37: /* arrow left */
              if (event.shiftKey) {
                selection.transformEnd(0, -1);
              }
              else {
                selection.transformStart(0, -1);
              }
              event.preventDefault();
              break;

            case 8: /* backspace */
            case 46: /* delete */
              selection.empty(event);
              event.preventDefault();
              break;

            case 40: /* arrow down */
              if (event.shiftKey) {
                selection.transformEnd(1, 0); //expanding selection down with shift
              }
              else {
                selection.transformStart(1, 0); //move selection down
              }
              event.preventDefault();
              break;

            case 113: /* F2 */
              event.preventDefault(); //prevent Opera from opening Go to Page dialog
              break;

            case 13: /* return/enter */
              r = priv.settings.enterMoves.row;
              c = priv.settings.enterMoves.col;
              if (event.shiftKey) {
                selection.transformStart(-r, -c); //move selection up
              }
              else {
                selection.transformStart(r, c); //move selection down
              }
              event.preventDefault(); //don't add newline to field
              break;

            case 36: /* home */
              if (event.ctrlKey || event.metaKey) {
                rangeModifier(self.view.getCellAtCoords({row: 0, col: priv.selStart.col}));
              }
              else {
                rangeModifier(self.view.getCellAtCoords({row: priv.selStart.row, col: 0}));
              }
              break;

            case 35: /* end */
              if (event.ctrlKey || event.metaKey) {
                rangeModifier(self.view.getCellAtCoords({row: self.rowCount - 1, col: priv.selStart.col}));
              }
              else {
                rangeModifier(self.view.getCellAtCoords({row: priv.selStart.row, col: self.colCount - 1}));
              }
              break;

            case 33: /* pg up */
              rangeModifier(self.view.getCellAtCoords({row: 0, col: priv.selStart.col}));
              break;

            case 34: /* pg dn */
              rangeModifier(self.view.getCellAtCoords({row: self.rowCount - 1, col: priv.selStart.col}));
              break;

            default:
              break;
          }
        }
      }

      priv.editProxy.on('click', onClick);
      priv.editProxyHolder.on('cut', onCut);
      priv.editProxyHolder.on('paste', onPaste);
      priv.editProxyHolder.on('keydown', onKeyDown);
      self.container.append(priv.editProxyHolder);
    },

    /**
     * Destroy current editor, if exists
     */
    destroy: function () {
      if (typeof priv.editorDestroyer === "function") {
        priv.editorDestroyer();
        priv.editorDestroyer = null;
      }
    },

    /**
     * Prepare text input to be displayed at given grid cell
     */
    prepare: function () {
      priv.editProxy.height(priv.editProxy.parent().innerHeight() - 4);
      priv.editProxy.val(datamap.getText(priv.selStart, priv.selEnd));
      setTimeout(editproxy.focus, 1);
      priv.editorDestroyer = self.view.applyCellTypeMethod('editor', self.view.getCellAtCoords(priv.selStart), priv.selStart, priv.editProxy);
    },

    /**
     * Sets focus to textarea
     */
    focus: function () {
      priv.editProxy[0].select();
    }
  };

  this.init = function () {
    this.view = new Handsontable.TableView(this);

    if (typeof settings.cols !== 'undefined') {
      settings.startCols = settings.cols; //backwards compatibility
    }

    self.colCount = settings.startCols;
    self.rowCount = 0;

    highlight.init();
    priv.currentBorder = new Handsontable.Border(self, {
      className: 'current',
      bg: true
    });
    editproxy.init();

    bindEvents();
    this.updateSettings(settings);

    Handsontable.PluginHooks.run(self, 'afterInit');
  };

  var bindEvents = function () {
    self.rootElement.on("beforedatachange.handsontable", function (event, changes) {
      if (priv.settings.autoComplete) { //validate strict autocompletes
        var typeahead = priv.editProxy.data('typeahead');
        loop : for (var c = changes.length - 1; c >= 0; c--) {
          for (var a = 0, alen = priv.settings.autoComplete.length; a < alen; a++) {
            var autoComplete = priv.settings.autoComplete[a];
            var source = autoComplete.source();
            if (changes[c][3] && autoComplete.match(changes[c][0], changes[c][1], datamap.getAll)) {
              var lowercaseVal = changes[c][3].toLowerCase();
              for (var s = 0, slen = source.length; s < slen; s++) {
                if (changes[c][3] === source[s]) {
                  continue loop; //perfect match
                }
                else if (lowercaseVal === source[s].toLowerCase()) {
                  changes[c][3] = source[s]; //good match, fix the case
                  continue loop;
                }
              }
              if (autoComplete.strict) {
                changes.splice(c, 1); //no match, invalidate this change
                continue loop;
              }
            }
          }
        }
      }

      if (priv.settings.onBeforeChange) {
        var result = priv.settings.onBeforeChange.apply(self.rootElement[0], [changes]);
        if (result === false) {
          changes.splice(0, changes.length); //invalidate all changes (remove everything from array)
        }
      }
    });
    self.rootElement.on("datachange.handsontable", function (event, changes, source) {
      if (priv.settings.onChange) {
        priv.settings.onChange.apply(self.rootElement[0], [changes, source]);
      }
    });
    self.rootElement.on("selection.handsontable", function (event, row, col, endRow, endCol) {
      if (priv.settings.onSelection) {
        priv.settings.onSelection.apply(self.rootElement[0], [row, col, endRow, endCol]);
      }
    });
    self.rootElement.on("selectionbyprop.handsontable", function (event, row, prop, endRow, endProp) {
      if (priv.settings.onSelectionByProp) {
        priv.settings.onSelectionByProp.apply(self.rootElement[0], [row, prop, endRow, endProp]);
      }
    });
  };

  /**
   * Set data at given cell
   * @public
   * @param {Number|Array} row or array of changes in format [[row, col, value], ...]
   * @param {Number} prop
   * @param {String} value
   * @param {String} [source='edit'] String that identifies how this change will be described in changes array (useful in onChange callback)
   */
  this.setDataAtCell = function (row, prop, value, source) {
    var refreshRows = false, refreshCols = false, changes, i, ilen, td, changesByCol = [];

    if (typeof row === "object") { //is stringish
      changes = row;
    }
    else if (Object.prototype.toString.call(value) === '[object Object]') { //backwards compatibility
      changes = value;
    }
    else {
      changes = [
        [row, prop, value]
      ];
    }

    for (i = 0, ilen = changes.length; i < ilen; i++) {
      changes[i].splice(2, 0, datamap.get(changes[i][0], changes[i][1])); //add old value at index 2
    }

    self.rootElement.triggerHandler("beforedatachange.handsontable", [changes]);

    for (i = 0, ilen = changes.length; i < ilen; i++) {
      row = changes[i][0];
      prop = changes[i][1];
      var col = datamap.propToCol(prop);
      value = changes[i][3];
      changesByCol.push([changes[i][0], col, changes[i][2], changes[i][3], changes[i][4]]);

      if (priv.settings.minSpareRows) {
        while (row > self.rowCount - 1) {
          datamap.createRow();
          self.view.createRow();
          refreshRows = true;
        }
      }
      if (priv.dataType === 'array' && priv.settings.minSpareCols) {
        while (col > self.colCount - 1) {
          datamap.createCol();
          self.view.createCol();
          refreshCols = true;
        }
      }
      td = self.view.render(row, col, prop, value);
      datamap.set(row, prop, value);
    }
    if (refreshRows) {
      self.blockedCols.refresh();
    }
    if (refreshCols) {
      self.blockedRows.refresh();
    }
    var recreated = grid.keepEmptyRows();
    if (!recreated) {
      selection.refreshBorders();
    }
    if (changes.length) {
      self.rootElement.triggerHandler("datachange.handsontable", [changes, source || 'edit']);
      self.rootElement.triggerHandler("cellrender.handsontable", [changes, source || 'edit']);
    }
    return td;
  };

  /**
   * Populate cells at position with 2d array
   * @param {Object} start Start selection position
   * @param {Array} input 2d array
   * @param {Object} [end] End selection position (only for drag-down mode)
   * @param {String} [source="populateFromArray"]
   * @return {Object|undefined} ending td in pasted area (only if any cell was changed)
   */
  this.populateFromArray = function (start, input, end, source) {
    return grid.populateFromArray(start, input, end, source);
  };

  /**
   * Returns the top left (TL) and bottom right (BR) selection coordinates
   * @param {Object[]} coordsArr
   * @returns {Object}
   */
  this.getCornerCoords = function (coordsArr) {
    return grid.getCornerCoords(coordsArr);
  };

  /**
   * Returns current selection. Returns undefined if there is no selection.
   * @public
   * @return {Array} [topLeftRow, topLeftCol, bottomRightRow, bottomRightCol]
   */
  this.getSelected = function () { //https://github.com/warpech/jquery-handsontable/issues/44  //cjl
    if (selection.isSelected()) {
      var coords = grid.getCornerCoords([priv.selStart, priv.selEnd]);
      return [coords.TL.row, coords.TL.col, coords.BR.row, coords.BR.col];
    }
  };

  /**
   * Render visible data
   * @public
   * @param {Array} changes (Optional) If not given, all visible grid will be rerendered
   * @param {String} source (Optional)
   */
  this.render = function (changes, source) {
    if (typeof changes === "undefined") {
      changes = [];
      var r, c, p, val, clen = (priv.settings.columns && priv.settings.columns.length) || priv.settings.startCols;
      for (r = 0; r < priv.settings.startRows; r++) {
        for (c = 0; c < clen; c++) {
          p = datamap.colToProp(c);
          val = datamap.get(r, p);
          changes.push([r, p, val, val]);
        }
      }
    }
    for (var i = 0, ilen = changes.length; i < ilen; i++) {
      self.view.render(changes[i][0], datamap.propToCol(changes[i][1]), changes[i][1], changes[i][3]);
    }
    self.rootElement.triggerHandler('cellrender.handsontable', [changes, source || 'render']);
  };

  /**
   * Load data from array
   * @public
   * @param {Array} data
   */
  this.loadData = function (data) {
    priv.isPopulated = false;
    priv.settings.data = data;
    if (typeof data === 'object' && typeof data[0] === 'object' && typeof data[0].push !== 'function') {
      priv.dataType = 'object';
    }
    else {
      priv.dataType = 'array';
    }
    priv.duckDataSchema = datamap.recursiveDuckSchema(data[0]);
    datamap.createMap();
    var dlen = priv.settings.data.length;
    while (priv.settings.startRows > dlen) {
      datamap.createRow();
      dlen++;
    }
    while (self.rowCount < dlen) {
      self.view.createRow();
    }

    grid.keepEmptyRows();
    grid.clear();
    var changes = [];
    var clen = (priv.settings.columns && priv.settings.columns.length) || priv.settings.startCols;
    for (var r = 0; r < dlen; r++) {
      for (var c = 0; c < clen; c++) {
        var p = datamap.colToProp(c);
        changes.push([r, p, "", datamap.get(r, p)])
      }
    }
    self.rootElement.triggerHandler('datachange.handsontable', [changes, 'loadData']);
    self.render(changes, 'loadData');
    priv.isPopulated = true;
    self.clearUndo();
  };

  /**
   * Return the current data object (the same that was passed by `data` configuration option or `loadData` method). Optionally you can provide cell range `r`, `c`, `r2`, `c2` to get only a fragment of grid data
   * @public
   * @param {Number} r (Optional) From row
   * @param {Number} c (Optional) From col
   * @param {Number} r2 (Optional) To row
   * @param {Number} c2 (Optional) To col
   * @return {Array|Object}
   */
  this.getData = function (r, c, r2, c2) {
    if (typeof r === 'undefined') {
      return datamap.getAll();
    }
    else {
      return datamap.getRange({row: r, col: c}, {row: r2, col: c2});
    }
  };

  /**
   * Update settings
   * @public
   */
  this.updateSettings = function (settings) {
    var i, j, recreated;

    if (typeof settings.rows !== "undefined") {
      settings.startRows = settings.rows; //backwards compatibility
    }
    if (typeof settings.cols !== "undefined") {
      settings.startCols = settings.cols; //backwards compatibility
    }

    if (typeof settings.fillHandle !== "undefined") {
      if (autofill.handle && settings.fillHandle === false) {
        autofill.disable();
      }
      else if (!autofill.handle && settings.fillHandle !== false) {
        autofill.init();
      }
    }

    if (typeof settings.undo !== "undefined") {
      if (priv.undoRedo && settings.undo === false) {
        priv.undoRedo = null;
      }
      else if (!priv.undoRedo && settings.undo === true) {
        priv.undoRedo = new Handsontable.UndoRedo(self);
      }
    }

    if (!self.blockedCols) {
      self.blockedCols = new Handsontable.BlockedCols(self);
      self.blockedRows = new Handsontable.BlockedRows(self);
    }

    for (i in settings) {
      if (i === 'data') {
        continue; //loadData will be triggered later
      }
      else if (settings.hasOwnProperty(i)) {
        priv.settings[i] = settings[i];

        //launch extensions
        if (Handsontable.extension[i]) {
          priv.extensions[i] = new Handsontable.extension[i](self, settings[i]);
        }
      }
    }

    if (typeof settings.colHeaders !== "undefined") {
      if (settings.colHeaders === false && priv.extensions["ColHeader"]) {
        priv.extensions["ColHeader"].destroy();
      }
      else if (settings.colHeaders !== false) {
        priv.extensions["ColHeader"] = new Handsontable.ColHeader(self, settings.colHeaders);
      }
    }

    if (typeof settings.rowHeaders !== "undefined") {
      if (settings.rowHeaders === false && priv.extensions["RowHeader"]) {
        priv.extensions["RowHeader"].destroy();
      }
      else if (settings.rowHeaders !== false) {
        priv.extensions["RowHeader"] = new Handsontable.RowHeader(self, settings.rowHeaders);
      }
    }

    var blockedRowsCount = self.blockedRows.count();
    var blockedColsCount = self.blockedCols.count();
    if (blockedRowsCount && blockedColsCount && (typeof settings.rowHeaders !== "undefined" || typeof settings.colHeaders !== "undefined")) {
      if (self.blockedCorner) {
        self.blockedCorner.remove();
        self.blockedCorner = null;
      }

      var position = self.table.position();
      self.positionFix(position);

      var div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.top = position.top + 'px';
      div.style.left = position.left + 'px';

      var table = document.createElement('table');
      table.cellPadding = 0;
      table.cellSpacing = 0;
      div.appendChild(table);

      var thead = document.createElement('thead');
      table.appendChild(thead);

      var tr, th;
      for (i = 0; i < blockedRowsCount; i++) {
        tr = document.createElement('tr');
        for (j = blockedColsCount - 1; j >= 0; j--) {
          th = document.createElement('th');
          th.className = self.blockedCols.headers[j].className;
          th.innerHTML = self.blockedCols.headerText('&nbsp;');
          self.minWidthFix(th);
          tr.appendChild(th);
        }
        thead.appendChild(tr);
      }
      self.blockedCorner = $(div);
      self.blockedCorner.on('click', function () {
        selection.selectAll();
      });
      self.container.append(self.blockedCorner);
    }
    else {
      if (self.blockedCorner) {
        self.blockedCorner.remove();
        self.blockedCorner = null;
      }
    }

    if (typeof settings.data !== 'undefined') {
      self.loadData(settings.data);
      recreated = true;
    }
    else if (typeof settings.columns !== "undefined") {
      datamap.createMap();
    }

    if (!recreated) {
      recreated = grid.keepEmptyRows();
    }

    if (!recreated) {
      selection.refreshBorders();
    }

    self.blockedCols.update();
    self.blockedRows.update();
  };

  /**
   * Returns current settings object
   * @return {Object}
   */
  this.getSettings = function () {
    return priv.settings;
  };

  /**
   * Clears grid
   * @public
   */
  this.clear = function () {
    selection.selectAll();
    selection.empty();
  };

  /**
   * Return true if undo can be performed, false otherwise
   * @public
   */
  this.isUndoAvailable = function () {
    return priv.undoRedo && priv.undoRedo.isUndoAvailable();
  };

  /**
   * Return true if redo can be performed, false otherwise
   * @public
   */
  this.isRedoAvailable = function () {
    return priv.undoRedo && priv.undoRedo.isRedoAvailable();
  };

  /**
   * Undo last edit
   * @public
   */
  this.undo = function () {
    priv.undoRedo && priv.undoRedo.undo();
  };

  /**
   * Redo edit (used to reverse an undo)
   * @public
   */
  this.redo = function () {
    priv.undoRedo && priv.undoRedo.redo();
  };

  /**
   * Clears undo history
   * @public
   */
  this.clearUndo = function () {
    priv.undoRedo && priv.undoRedo.clear();
  };

  /**
   * Alters the grid
   * @param {String} action See grid.alter for possible values
   * @param {Number} from
   * @param {Number} [to] Optional. Used only for actions "remove_row" and "remove_col"
   * @public
   */
  this.alter = function (action, from, to) {
    if (typeof to === "undefined") {
      to = from;
    }
    switch (action) {
      case "insert_row":
      case "remove_row":
        grid.alter(action, {row: from, col: 0}, {row: to, col: 0});
        break;

      case "insert_col":
      case "remove_col":
        grid.alter(action, {row: 0, col: from}, {row: 0, col: to});
        break;

      default:
        throw Error('There is no such action "' + action + '"');
        break;
    }
  };

  /**
   * Returns <td> element corresponding to params row, col
   * @param {Number} row
   * @param {Number} col
   * @public
   * @return {Element}
   */
  this.getCell = function (row, col) {
    return self.view.getCellAtCoords({row: row, col: col});
  };

  /**
   * Returns property name associated with column number
   * @param {Number} col
   * @public
   * @return {String}
   */
  this.colToProp = function (col) {
    return datamap.colToProp(col);
  };

  /**
   * Returns column number associated with property name
   * @param {String} prop
   * @public
   * @return {Number}
   */
  this.propToCol = function (prop) {
    return datamap.propToCol(prop);
  };

  /**
   * Return cell value at `row`, `col`
   * @param {Number} row
   * @param {Number} col
   * @public
   * @return {string}
   */
  this.getDataAtCell = function (row, col) {
    return datamap.get(row, datamap.colToProp(col));
  };

  /**
   * Returns cell meta data object corresponding to params row, col
   * @param {Number} row
   * @param {Number} col
   * @public
   * @return {Object}
   */
  this.getCellMeta = function (row, col) {
    var cellProperites = {}
      , prop = datamap.colToProp(col);
    if (priv.settings.columns) {
      cellProperites = $.extend(true, cellProperites, priv.settings.columns[col] || {});
    }
    if (priv.settings.cells) {
      cellProperites = $.extend(true, cellProperites, priv.settings.cells(row, col, prop) || {});
    }
    cellProperites.isWritable = grid.isCellWritable($(self.view.getCellAtCoords({row: row, col: col})), cellProperites);
    return cellProperites;
  };

  /**
   * Sets cell to be readonly
   * @param {Number} row
   * @param {Number} col
   * @public
   */
  this.setCellReadOnly = function (row, col) {
    $(self.view.getCellAtCoords({row: row, col: col})).data("readOnly", true);
  };

  /**
   * Sets cell to be editable (removes readonly)
   * @param {Number} row
   * @param {Number} col
   * @public
   */
  this.setCellEditable = function (row, col) {
    $(self.view.getCellAtCoords({row: row, col: col})).data("readOnly", false);
  };

  /**
   * Returns headers (if they are enabled)
   * @param {Object} obj Instance of rowHeader or colHeader
   * @param {Number} count Number of rows or cols
   * @param {Number} index (Optional) Will return only header at given index
   * @return {Array|String}
   */
  var getHeaderText = function (obj, count, index) {
    if (obj) {
      if (typeof index !== 'undefined') {
        return obj.columnLabel(index);
      }
      else {
        var headers = [];
        for (var i = 0; i < count; i++) {
          headers.push(obj.columnLabel(i));
        }
        return headers;
      }
    }
  };

  /**
   * Return array of row headers (if they are enabled). If param `row` given, return header at given row as string
   * @param {Number} row (Optional)
   * @return {Array|String}
   */
  this.getRowHeader = function (row) {
    return getHeaderText(self.rowHeader, self.rowCount, row);
  };

  /**
   * Return array of col headers (if they are enabled). If param `col` given, return header at given col as string
   * @param {Number} col (Optional)
   * @return {Array|String}
   */
  this.getColHeader = function (col) {
    return getHeaderText(self.colHeader, self.colCount, col);
  };

  /**
   * Selects cell on grid. Optionally selects range to another cell
   * @param {Number} row
   * @param {Number} col
   * @param {Number} [endRow]
   * @param {Number} [endCol]
   * @param {Boolean} [scrollToCell=true] If true, viewport will be scrolled to the selection
   * @public
   */
  this.selectCell = function (row, col, endRow, endCol, scrollToCell) {
    if (typeof row !== 'number' || row < 0 || row >= self.rowCount) {
      return false;
    }
    if (typeof col !== 'number' || col < 0 || col >= self.colCount) {
      return false;
    }
    if (typeof endRow !== "undefined") {
      if (typeof endRow !== 'number' || endRow < 0 || endRow >= self.rowCount) {
        return false;
      }
      if (typeof endCol !== 'number' || endCol < 0 || endCol >= self.colCount) {
        return false;
      }
    }
    selection.start({row: row, col: col});
    if (typeof endRow === "undefined") {
      selection.setRangeEnd(self.getCell(row, col), scrollToCell);
    }
    else {
      selection.setRangeEnd(self.getCell(endRow, endCol), scrollToCell);
    }
  };

  this.selectCellByProp = function (row, prop, endRow, endProp, scrollToCell) {
    arguments[1] = datamap.propToCol(arguments[1]);
    if (typeof arguments[3] !== "undefined") {
      arguments[3] = datamap.propToCol(arguments[3]);
    }
    return self.selectCell.apply(self, arguments);
  };

  /**
   * Deselects current sell selection on grid
   * @public
   */
  this.deselectCell = function () {
    selection.deselect();
  };

  /**
   * Remove grid from DOM
   * @public
   */
  this.destroy = function () {
    self.rootElement.empty();
    self.rootElement.removeData('handsontable');
  };
};

var settings = {
  'data': [],
  'startRows': 5,
  'startCols': 5,
  'minSpareRows': 0,
  'minSpareCols': 0,
  'minHeight': 0,
  'minWidth': 0,
  'multiSelect': true,
  'fillHandle': true,
  'undo': true,
  'outsideClickDeselects': true,
  'enterBeginsEditing': true,
  'enterMoves': {row: 1, col: 0},
  'tabMoves': {row: 0, col: 1},
  'autoWrapRow': false,
  'autoWrapCol': false
};

$.fn.handsontable = function (action, options) {
  var i, ilen, args, output = [];
  if (typeof action !== 'string') { //init
    options = action;
    return this.each(function () {
      var $this = $(this);
      if ($this.data("handsontable")) {
        instance = $this.data("handsontable");
        instance.updateSettings(options);
      }
      else {
        var currentSettings = $.extend(true, {}, settings), instance;
        for (i in options) {
          if (options.hasOwnProperty(i)) {
            currentSettings[i] = options[i];
          }
        }
        instance = new Handsontable.Core($this, currentSettings);
        $this.data("handsontable", instance);
        instance.init();
      }
    });
  }
  else {
    args = [];
    if (arguments.length > 1) {
      for (i = 1, ilen = arguments.length; i < ilen; i++) {
        args.push(arguments[i]);
      }
    }
    this.each(function () {
      output = $(this).data("handsontable")[action].apply(this, args);
    });
    return output;
  }
};
/**
 * Handsontable TableView constructor
 * @param {Object} instance
 */
Handsontable.TableView = function (instance) {
  var that = this;
  this.instance = instance;
  var priv = {};

  var interaction = {
    onMouseDown: function (event) {
      priv.isMouseDown = true;
      if (event.button === 2 && that.instance.selection.inInSelection(that.getCellCoords(this))) { //right mouse button
        //do nothing
      }
      else if (event.shiftKey) {
        that.instance.selection.setRangeEnd(this);
      }
      else {
        that.instance.selection.setRangeStart(this);
      }
    },

    onMouseOver: function () {
      if (priv.isMouseDown) {
        that.instance.selection.setRangeEnd(this);
      }
      else if (that.instance.autofill.handle && that.instance.autofill.handle.isDragged) {
        that.instance.autofill.handle.isDragged++;
        that.instance.autofill.showBorder(this);
      }
    },

    onMouseWheel: function (event, delta, deltaX, deltaY) {
      if (priv.virtualScroll) {
        if (deltaY) {
          priv.virtualScroll.scrollTop(priv.virtualScroll.scrollTop() + 44 * -deltaY);
        }
        else if (deltaX) {
          priv.virtualScroll.scrollLeft(priv.virtualScroll.scrollLeft() + 100 * deltaX);
        }
        event.preventDefault();
      }
    }
  };


  that.instance.container = $('<div class="handsontable"></div>');
  var overflow = that.instance.rootElement.css('overflow');
  if (overflow === 'auto' || overflow === 'scroll') {
    that.instance.container[0].style.overflow = overflow;
    var w = that.instance.rootElement.css('width');
    if (w) {
      that.instance.container[0].style.width = w;
    }
    var h = that.instance.rootElement.css('height');
    if (h) {
      that.instance.container[0].style.height = h;
    }
    that.instance.rootElement[0].style.overflow = 'hidden';
    that.instance.rootElement[0].style.position = 'relative';
  }
  that.instance.rootElement.append(that.instance.container);

//this.init

  function onMouseEnterTable() {
    priv.isMouseOverTable = true;
  }

  function onMouseLeaveTable() {
    priv.isMouseOverTable = false;
  }

  that.instance.curScrollTop = that.instance.curScrollLeft = 0;
  that.instance.lastScrollTop = that.instance.lastScrollLeft = null;
  this.scrollbarSize = this.measureScrollbar();

  var div = $('<div><table class="htCore" cellspacing="0" cellpadding="0"><thead></thead><tbody></tbody></table></div>');
  priv.tableContainer = div[0];
  that.instance.table = $(priv.tableContainer.firstChild);
  this.$tableBody = that.instance.table.find("tbody")[0];
  that.instance.table.on('mousedown', 'td', interaction.onMouseDown);
  that.instance.table.on('mouseover', 'td', interaction.onMouseOver);
  that.instance.table.on('mousewheel', 'td', interaction.onMouseWheel);
  that.instance.container.append(div);

  //...


  that.instance.container.on('mouseenter', onMouseEnterTable).on('mouseleave', onMouseLeaveTable);


  function onMouseUp() {
    if (priv.isMouseDown) {
      setTimeout(that.instance.editproxy.focus, 1);
    }
    priv.isMouseDown = false;
    if (that.instance.autofill.handle && that.instance.autofill.handle.isDragged) {
      if (that.instance.autofill.handle.isDragged > 1) {
        that.instance.autofill.apply();
      }
      that.instance.autofill.handle.isDragged = 0;
    }
  }

  function onOutsideClick(event) {
    if (that.instance.getSettings().outsideClickDeselects) {
      setTimeout(function () {//do async so all mouseenter, mouseleave events will fire before
        if (!priv.isMouseOverTable && event.target !== priv.tableContainer && $(event.target).attr('id') !== 'context-menu-layer') { //if clicked outside the table or directly at container which also means outside
          that.instance.selection.deselect();
        }
      }, 1);
    }
  }

  $("html").on('mouseup', onMouseUp).
    on('click', onOutsideClick);

  if (that.instance.container[0].tagName.toLowerCase() !== "html" && that.instance.container[0].tagName.toLowerCase() !== "body" && (that.instance.container.css('overflow') === 'scroll' || that.instance.container.css('overflow') === 'auto')) {
    that.scrollable = that.instance.container;
  }

  if (that.scrollable) {
    //create fake scrolling div
    priv.virtualScroll = $('<div class="virtualScroll"><div class="spacer"></div></div>');
    that.scrollable = priv.virtualScroll;
    that.instance.container.before(priv.virtualScroll);
    that.instance.table[0].style.position = 'absolute';
    priv.virtualScroll.css({
      width: that.instance.container.width() + 'px',
      height: that.instance.container.height() + 'px',
      overflow: that.instance.container.css('overflow')
    });
    that.instance.container.css({
      overflow: 'hidden',
      position: 'absolute',
      top: '0px',
      left: '0px'
    });
    that.instance.container.width(priv.virtualScroll.innerWidth() - this.scrollbarSize.width);
    that.instance.container.height(priv.virtualScroll.innerHeight() - this.scrollbarSize.height);
    setInterval(function () {
      priv.virtualScroll.find('.spacer').height(that.instance.table.height());
      priv.virtualScroll.find('.spacer').width(that.instance.table.width());
    }, 100);

    that.scrollable.scrollTop(0);
    that.scrollable.scrollLeft(0);

    that.scrollable.on('scroll.handsontable', function () {
      that.instance.curScrollTop = that.scrollable[0].scrollTop;
      that.instance.curScrollLeft = that.scrollable[0].scrollLeft;

      if (that.instance.curScrollTop !== that.instance.lastScrollTop) {
        that.instance.blockedRows.refreshBorders();
        that.instance.blockedCols.main[0].style.top = -that.instance.curScrollTop + 'px';
        that.instance.table[0].style.top = -that.instance.curScrollTop + 'px';
      }

      if (that.instance.curScrollLeft !== that.instance.lastScrollLeft) {
        that.instance.blockedCols.refreshBorders();
        that.instance.blockedRows.main[0].style.left = -that.instance.curScrollLeft + 'px';
        that.instance.table[0].style.left = -that.instance.curScrollLeft + 'px';
      }

      if (that.instance.curScrollTop !== that.instance.lastScrollTop || that.instance.curScrollLeft !== that.instance.lastScrollLeft) {
        that.instance.selection.refreshBorders();

        if (that.instance.blockedCorner) {
          if (that.instance.curScrollTop === 0 && that.instance.curScrollLeft === 0) {
            that.instance.blockedCorner.find("th:last-child").css({borderRightWidth: 0});
            that.instance.blockedCorner.find("tr:last-child th").css({borderBottomWidth: 0});
          }
          else if (that.instance.lastScrollTop === 0 && that.instance.lastScrollLeft === 0) {
            that.instance.blockedCorner.find("th:last-child").css({borderRightWidth: '1px'});
            that.instance.blockedCorner.find("tr:last-child th").css({borderBottomWidth: '1px'});
          }
        }
      }

      that.instance.lastScrollTop = that.instance.curScrollTop;
      that.instance.lastScrollLeft = that.instance.curScrollLeft;

      that.instance.selection.refreshBorders();
    });

    Handsontable.PluginHooks.push('afterInit', function () {
      that.scrollable.trigger('scroll.handsontable');
    });
  }
  else {
    that.scrollable = $(window);
    if (that.instance.blockedCorner) {
      that.instance.blockedCorner.find("th:last-child").css({borderRightWidth: 0});
      that.instance.blockedCorner.find("tr:last-child th").css({borderBottomWidth: 0});
    }
  }

  that.scrollable.on('scroll', function (e) {
    e.stopPropagation();
  });

  $(window).on('resize', function () {
    //https://github.com/warpech/jquery-handsontable/issues/193
    that.instance.blockedCols.update();
    that.instance.blockedRows.update();
  });

  $('.context-menu-root').on('mouseenter', onMouseEnterTable).on('mouseleave', onMouseLeaveTable);

};

/**
 * Measure the width and height of browser scrollbar
 * @return {Object}
 */
Handsontable.TableView.prototype.measureScrollbar = function () {
  var div = $('<div style="width:150px;height:150px;overflow:hidden;position:absolute;top:200px;left:200px"><div style="width:100%;height:100%;position:absolute">x</div>');
  $('body').append(div);
  var subDiv = $(div[0].firstChild);
  var w1 = subDiv.innerWidth();
  var h1 = subDiv.innerHeight();
  div[0].style.overflow = 'scroll';
  w1 -= subDiv.innerWidth();
  h1 -= subDiv.innerHeight();
  if (w1 === 0) {
    w1 = 17;
  }
  if (h1 === 0) {
    h1 = 17;
  }
  div.remove();
  return {width: w1, height: h1};
};

/**
 * Creates row at the bottom of the <table>
 * @param {Object} [coords] Optional. Coords of the cell before which the new row will be inserted
 */
Handsontable.TableView.prototype.createRow = function (coords) {
  var tr, c, r, td, p;
  tr = document.createElement('tr');
  this.instance.blockedCols.createRow(tr);
  for (c = 0; c < this.instance.colCount; c++) {
    tr.appendChild(td = document.createElement('td'));
    this.instance.minWidthFix(td);
  }
  if (!coords || coords.row >= this.instance.rowCount) {
    this.$tableBody.appendChild(tr);
    r = this.instance.rowCount;
  }
  else {
    var oldTr = this.instance.getCell(coords.row, coords.col).parentNode;
    this.$tableBody.insertBefore(tr, oldTr);
    r = coords.row;
  }
  this.instance.rowCount++;
  for (c = 0; c < this.instance.colCount; c++) {
    p = this.instance.colToProp(c);
    this.render(r, c, p, this.instance.getData()[r][p]);
  }
};

/**
 * Creates col at the right of the <table>
 * @param {Object} [coords] Optional. Coords of the cell before which the new column will be inserted
 */
Handsontable.TableView.prototype.createCol = function (coords) {
  var trs = this.$tableBody.childNodes, r, c, td, p;
  this.instance.blockedRows.createCol();
  if (!coords || coords.col >= this.instance.colCount) {
    for (r = 0; r < this.instance.rowCount; r++) {
      trs[r].appendChild(td = document.createElement('td'));
      this.instance.minWidthFix(td);
    }
    c = this.instance.colCount;
  }
  else {
    for (r = 0; r < this.instance.rowCount; r++) {
      trs[r].insertBefore(td = document.createElement('td'), this.instance.getCell(r, coords.col));
      this.instance.minWidthFix(td);
    }
    c = coords.col;
  }
  this.instance.colCount++;
  for (r = 0; r < this.instance.rowCount; r++) {
    p = this.instance.colToProp(c);
    this.render(r, c, p, this.instance.getData()[r][p]);
  }
};

/**
 * Removes row at the bottom of the <table>
 * @param {Object} [coords] Optional. Coords of the cell which row will be removed
 * @param {Object} [toCoords] Required if coords is defined. Coords of the cell until which all rows will be removed
 */
Handsontable.TableView.prototype.removeRow = function (coords, toCoords) {
  if (!coords || coords.row === this.instance.rowCount - 1) {
    $(this.$tableBody.childNodes[this.instance.rowCount - 1]).remove();
    this.instance.rowCount--;
  }
  else {
    for (var i = toCoords.row; i >= coords.row; i--) {
      $(this.$tableBody.childNodes[i]).remove();
      this.instance.rowCount--;
    }
  }
};

/**
 * Removes col at the right of the <table>
 * @param {Object} [coords] Optional. Coords of the cell which col will be removed
 * @param {Object} [toCoords] Required if coords is defined. Coords of the cell until which all cols will be removed
 */
Handsontable.TableView.prototype.removeCol = function (coords, toCoords) {
  var trs = this.$tableBody.childNodes, colThs, i;
  if (this.instance.blockedRows) {
    colThs = this.instance.table.find('thead th');
  }
  var r = 0;
  if (!coords || coords.col === this.instance.colCount - 1) {
    for (; r < this.instance.rowCount; r++) {
      $(trs[r].childNodes[this.instance.colCount + this.instance.blockedCols.count() - 1]).remove();
      if (colThs) {
        colThs.eq(this.instance.colCount + this.instance.blockedCols.count() - 1).remove();
      }
    }
    this.instance.colCount--;
  }
  else {
    for (; r < this.instance.rowCount; r++) {
      for (i = toCoords.col; i >= coords.col; i--) {
        $(trs[r].childNodes[i + this.instance.blockedCols.count()]).remove();

      }
    }
    if (colThs) {
      for (i = toCoords.col; i >= coords.col; i--) {
        colThs.eq(i + this.instance.blockedCols.count()).remove();
      }
    }
    this.instance.colCount -= toCoords.col - coords.col + 1;
  }
};


Handsontable.TableView.prototype.render = function (row, col, prop, value) {
  var coords = {row: row, col: col};
  var td = this.instance.getCell(row, col);
  this.applyCellTypeMethod('renderer', td, coords, value);
  this.instance.minWidthFix(td);
  return td;
};


Handsontable.TableView.prototype.applyCellTypeMethod = function (methodName, td, coords, extraParam) {
  var prop = this.instance.colToProp(coords.col)
    , method
    , cellProperties = this.instance.getCellMeta(coords.row, coords.col)
    , settings = this.instance.getSettings();

  if (cellProperties.type && typeof cellProperties.type[methodName] === "function") {
    method = cellProperties.type[methodName];
  }
  else if (settings.autoComplete) {
    for (var i = 0, ilen = settings.autoComplete.length; i < ilen; i++) {
      if (settings.autoComplete[i].match(coords.row, coords.col, this.instance.getData())) {
        method = Handsontable.AutocompleteCell[methodName];
        cellProperties.autoComplete = settings.autoComplete[i];
        break;
      }
    }
  }
  if (typeof method !== "function") {
    method = Handsontable.TextCell[methodName];
  }
  return method(this.instance, td, coords.row, coords.col, prop, extraParam, cellProperties);
};

/**
 * Returns coordinates given td object
 */
Handsontable.TableView.prototype.getCellCoords = function (td) {
  return {
    row: td.parentNode.rowIndex - this.instance.blockedRows.count(),
    col: td.cellIndex - this.instance.blockedCols.count()
  };
};

/**
 * Returns td object given coordinates
 */
Handsontable.TableView.prototype.getCellAtCoords = function (coords) {
  if (coords.row < 0 || coords.col < 0) {
    return null;
  }
  var tr = this.$tableBody.childNodes[coords.row];
  if (tr) {
    return tr.childNodes[coords.col + this.instance.blockedCols.count()];
  }
  else {
    return null;
  }
};

/**
 * Returns all td objects in grid
 */
Handsontable.TableView.prototype.getAllCells = function () {
  var tds = [], trs, r, rlen, c, clen;
  trs = this.$tableBody.childNodes;
  rlen = this.instance.rowCount;
  if (rlen > 0) {
    clen = this.instance.colCount;
    for (r = 0; r < rlen; r++) {
      for (c = 0; c < clen; c++) {
        tds.push(trs[r].childNodes[c + this.instance.blockedCols.count()]);
      }
    }
  }
  return tds;
};

/**
 * Scroll viewport to selection
 * @param td
 */
Handsontable.TableView.prototype.scrollViewport = function (td) {
  if (!this.instance.selection.isSelected()) {
    return false;
  }

  var $td = $(td);
  var tdOffset = $td.offset();
  var scrollLeft = this.scrollable.scrollLeft(); //scrollbar position
  var scrollTop = this.scrollable.scrollTop(); //scrollbar position
  var scrollOffset = this.scrollable.offset();
  var rowHeaderWidth = this.instance.blockedCols.count() ? $(this.instance.blockedCols.main[0].firstChild).outerWidth() : 2;
  var colHeaderHeight = this.instance.blockedRows.count() ? $(this.instance.blockedRows.main[0].firstChild).outerHeight() : 2;

  var offsetTop = tdOffset.top;
  var offsetLeft = tdOffset.left;
  var scrollWidth, scrollHeight;
  if (scrollOffset) { //if is not the window
    scrollWidth = this.scrollable.outerWidth();
    scrollHeight = this.scrollable.outerHeight();
    offsetTop += scrollTop - scrollOffset.top;
    offsetLeft += scrollLeft - scrollOffset.left;
  }
  else {
    scrollWidth = this.scrollable.width(); //don't use outerWidth with window (http://api.jquery.com/outerWidth/)
    scrollHeight = this.scrollable.height();
  }
  scrollWidth -= this.scrollbarSize.width;
  scrollHeight -= this.scrollbarSize.height;

  var height = $td.outerHeight();
  var width = $td.outerWidth();

  var that = this;
  if (scrollLeft + scrollWidth <= offsetLeft + width) {
    setTimeout(function () {
      that.scrollable.scrollLeft(offsetLeft + width - scrollWidth);
    }, 1);
  }
  else if (scrollLeft > offsetLeft - rowHeaderWidth) {
    setTimeout(function () {
      that.scrollable.scrollLeft(offsetLeft - rowHeaderWidth);
    }, 1);
  }

  if (scrollTop + scrollHeight <= offsetTop + height) {
    setTimeout(function () {
      that.scrollable.scrollTop(offsetTop + height - scrollHeight);
    }, 1);
  }
  else if (scrollTop > offsetTop - colHeaderHeight) {
    setTimeout(function () {
      that.scrollable.scrollTop(offsetTop - colHeaderHeight);
    }, 1);
  }
};
/**
 * Returns true if keyCode represents a printable character
 * @param {Number} keyCode
 * @return {Boolean}
 */
Handsontable.helper.isPrintableChar = function (keyCode) {
  return ((keyCode == 32) || //space
    (keyCode >= 48 && keyCode <= 57) || //0-9
    (keyCode >= 96 && keyCode <= 111) || //numpad
    (keyCode >= 186 && keyCode <= 192) || //;=,-./`
    (keyCode >= 219 && keyCode <= 222) || //[]{}\|"'
    keyCode >= 226 || //special chars (229 for Asian chars)
    (keyCode >= 65 && keyCode <= 90)); //a-z
};

/**
 * Converts a value to string
 * @param value
 * @return {String}
 */
Handsontable.helper.stringify = function (value) {
  switch (typeof value) {
    case 'string':
    case 'number':
      return value + '';
      break;

    case 'object':
      if (value === null) {
        return '';
      }
      else {
        return value.toString();
      }
      break;

    case 'undefined':
      return '';
      break;

    default:
      return value.toString();
  }
};

/**
 * Create DOM elements for selection border lines (top, right, bottom, left) and optionally background
 * @constructor
 * @param {Object} instance Handsontable instance
 * @param {Object} options Configurable options
 * @param {Boolean} [options.bg] Should include a background
 * @param {String} [options.className] CSS class for border elements
 */
Handsontable.Border = function (instance, options) {
  this.instance = instance;
  this.$container = instance.container;
  var container = this.$container[0];

  if (options.bg) {
    this.bg = document.createElement("div");
    this.bg.className = 'htBorderBg ' + options.className;
    container.insertBefore(this.bg, container.firstChild);
  }

  this.main = document.createElement("div");
  this.main.style.position = 'absolute';
  this.main.style.top = 0;
  this.main.style.left = 0;
  this.main.innerHTML = (new Array(5)).join('<div class="htBorder ' + options.className + '"></div>');
  this.disappear();
  container.appendChild(this.main);

  var nodes = this.main.childNodes;
  this.top = nodes[0];
  this.left = nodes[1];
  this.bottom = nodes[2];
  this.right = nodes[3];

  this.borderWidth = $(this.left).width();
};

Handsontable.Border.prototype = {
  /**
   * Show border around one or many cells
   * @param {Object[]} coordsArr
   */
  appear: function (coordsArr) {
    var $from, $to, fromOffset, toOffset, containerOffset, top, minTop, left, minLeft, height, width;
    if (this.disabled) {
      return;
    }

    this.corners = this.instance.getCornerCoords(coordsArr);

    $from = $(this.instance.getCell(this.corners.TL.row, this.corners.TL.col));
    $to = (coordsArr.length > 1) ? $(this.instance.getCell(this.corners.BR.row, this.corners.BR.col)) : $from;
    fromOffset = $from.offset();
    toOffset = (coordsArr.length > 1) ? $to.offset() : fromOffset;
    containerOffset = this.$container.offset();

    minTop = fromOffset.top;
    height = toOffset.top + $to.outerHeight() - minTop;
    minLeft = fromOffset.left;
    width = toOffset.left + $to.outerWidth() - minLeft;

    top = minTop - containerOffset.top + this.$container.scrollTop() - 1;
    left = minLeft - containerOffset.left + this.$container.scrollLeft() - 1;

    if (parseInt($from.css('border-top-width')) > 0) {
      top += 1;
      height -= 1;
    }
    if (parseInt($from.css('border-left-width')) > 0) {
      left += 1;
      width -= 1;
    }

    if (this.bg) {
      this.bg.style.top = top + 'px';
      this.bg.style.left = left + 'px';
      this.bg.style.width = width + 'px';
      this.bg.style.height = height + 'px';
      this.bg.style.display = 'block';
    }

    this.top.style.top = top + 'px';
    this.top.style.left = left + 'px';
    this.top.style.width = width + 'px';

    this.left.style.top = top + 'px';
    this.left.style.left = left + 'px';
    this.left.style.height = height + 'px';

    var delta = Math.floor(this.borderWidth / 2);

    this.bottom.style.top = top + height - delta + 'px';
    this.bottom.style.left = left + 'px';
    this.bottom.style.width = width + 'px';

    this.right.style.top = top + 'px';
    this.right.style.left = left + width - delta + 'px';
    this.right.style.height = height + 1 + 'px';

    this.main.style.display = 'block';
  },

  /**
   * Hide border
   */
  disappear: function () {
    this.main.style.display = 'none';
    if (this.bg) {
      this.bg.style.display = 'none';
    }
    this.corners = null;
  }
};
/**
 * Create DOM element for drag-down handle
 * @constructor
 * @param {Object} instance Handsontable instance
 */
Handsontable.FillHandle = function (instance) {
  this.instance = instance;
  this.$container = instance.container;
  var container = this.$container[0];

  this.handle = document.createElement("div");
  this.handle.className = "htFillHandle";
  this.disappear();
  container.appendChild(this.handle);

  var that = this;
  $(this.handle).mousedown(function () {
    that.isDragged = 1;
  });

  this.$container.find('table').on('selectstart', function (event) {
    //https://github.com/warpech/jquery-handsontable/issues/160
    //selectstart is IE only event. Prevent text from being selected when performing drag down in IE8
    event.preventDefault();
  });
};

Handsontable.FillHandle.prototype = {
  /**
   * Show handle in cell cornerł
   * @param {Object[]} coordsArr
   */
  appear: function (coordsArr) {
    if (this.disabled) {
      return;
    }

    var $td, tdOffset, containerOffset, top, left, height, width;

    var corners = this.instance.getCornerCoords(coordsArr);

    $td = $(this.instance.getCell(corners.BR.row, corners.BR.col));
    tdOffset = $td.offset();
    containerOffset = this.$container.offset();

    top = tdOffset.top - containerOffset.top + this.$container.scrollTop() - 1;
    left = tdOffset.left - containerOffset.left + this.$container.scrollLeft() - 1;
    height = $td.outerHeight();
    width = $td.outerWidth();

    this.handle.style.top = top + height - 3 + 'px';
    this.handle.style.left = left + width - 3 + 'px';
    this.handle.style.display = 'block';
  },

  /**
   * Hide handle
   */
  disappear: function () {
    this.handle.style.display = 'none';
  }
};
/**
 * Handsontable UndoRedo class
 */
Handsontable.UndoRedo = function (instance) {
  var that = this;
  this.instance = instance;
  this.clear();
  instance.rootElement.on("datachange.handsontable", function (event, changes, origin) {
    if (origin !== 'undo' && origin !== 'redo') {
      that.add(changes);
    }
  });
};

/**
 * Undo operation from current revision
 */
Handsontable.UndoRedo.prototype.undo = function () {
  var i, ilen;
  if (this.isUndoAvailable()) {
    var setData = $.extend(true, [], this.data[this.rev]);
    for (i = 0, ilen = setData.length; i < ilen; i++) {
      setData[i].splice(3, 1);
    }
    this.instance.setDataAtCell(setData, null, null, 'undo');
    this.rev--;
  }
};

/**
 * Redo operation from current revision
 */
Handsontable.UndoRedo.prototype.redo = function () {
  var i, ilen;
  if (this.isRedoAvailable()) {
    this.rev++;
    var setData = $.extend(true, [], this.data[this.rev]);
    for (i = 0, ilen = setData.length; i < ilen; i++) {
      setData[i].splice(2, 1);
    }
    this.instance.setDataAtCell(setData, null, null, 'redo');
  }
};

/**
 * Returns true if undo point is available
 * @return {Boolean}
 */
Handsontable.UndoRedo.prototype.isUndoAvailable = function () {
  return (this.rev >= 0);
};

/**
 * Returns true if redo point is available
 * @return {Boolean}
 */
Handsontable.UndoRedo.prototype.isRedoAvailable = function () {
  return (this.rev < this.data.length - 1);
};

/**
 * Add new history poins
 * @param changes
 */
Handsontable.UndoRedo.prototype.add = function (changes) {
  this.rev++;
  this.data.splice(this.rev); //if we are in point abcdef(g)hijk in history, remove everything after (g)
  this.data.push(changes);
};

/**
 * Clears undo history
 */
Handsontable.UndoRedo.prototype.clear = function () {
  this.data = [];
  this.rev = -1;
};
/**
 * Handsontable BlockedRows class
 * @param {Object} instance
 */
Handsontable.BlockedRows = function (instance) {
  var that = this;
  this.instance = instance;
  this.headers = [];
  var position = instance.table.position();
  instance.positionFix(position);
  this.main = $('<div style="position: absolute; top: ' + position.top + 'px; left: ' + position.left + 'px"><table class="htBlockedRows" cellspacing="0" cellpadding="0"><thead></thead></table></div>');
  this.instance.container.append(this.main);
  this.hasCSS3 = !($.browser.msie && (parseInt($.browser.version, 10) <= 8)); //Used to get over IE8- not having :last-child selector
  this.update();
  this.instance.rootElement.on('cellrender.handsontable', function (event, changes, source) {
    setTimeout(function () {
      that.dimensions();
    }, 10);
  });
};

/**
 * Returns number of blocked cols
 */
Handsontable.BlockedRows.prototype.count = function () {
  return this.headers.length;
};

/**
 * Create column header in the grid table
 */
Handsontable.BlockedRows.prototype.createCol = function (className) {
  var $tr, th, h, hlen = this.count();
  for (h = 0; h < hlen; h++) {
    $tr = this.main.find('thead tr.' + this.headers[h].className);
    if (!$tr.length) {
      $tr = $('<tr class="' + this.headers[h].className + '"></tr>');
      this.main.find('thead').append($tr);
    }
    $tr = this.instance.table.find('thead tr.' + this.headers[h].className);
    if (!$tr.length) {
      $tr = $('<tr class="' + this.headers[h].className + '"></tr>');
      this.instance.table.find('thead').append($tr);
    }

    th = document.createElement('th');
    th.className = this.headers[h].className;
    if (className) {
      th.className += ' ' + className;
    }
    th.innerHTML = this.headerText('&nbsp;');
    this.instance.minWidthFix(th);
    this.instance.table.find('thead tr.' + this.headers[h].className)[0].appendChild(th);

    th = document.createElement('th');
    th.className = this.headers[h].className;
    if (className) {
      th.className += ' ' + className;
    }
    this.instance.minWidthFix(th);
    this.main.find('thead tr.' + this.headers[h].className)[0].appendChild(th);
  }
};

/**
 * Create column header in the grid table
 */
Handsontable.BlockedRows.prototype.create = function () {
  var c;
  if (this.count() > 0) {
    this.instance.table.find('thead').empty();
    this.main.find('thead').empty();
    var offset = this.instance.blockedCols.count();
    for (c = offset - 1; c >= 0; c--) {
      this.createCol(this.instance.blockedCols.headers[c].className);
    }
    for (c = 0; c < this.instance.colCount; c++) {
      this.createCol();
    }
  }
  if (!this.hasCSS3) {
    this.instance.container.find('thead tr.lastChild').not(':last-child').removeClass('lastChild');
    this.instance.container.find('thead tr:last-child').not('.lastChild').addClass('lastChild');
  }
};

/**
 * Copy table column header onto the floating layer above the grid
 */
Handsontable.BlockedRows.prototype.refresh = function () {
  var label;
  if (this.count() > 0) {
    var that = this;
    var hlen = this.count(), h;
    for (h = 0; h < hlen; h++) {
      var $tr = this.main.find('thead tr.' + this.headers[h].className);
      var tr = $tr[0];
      var ths = tr.childNodes;
      var thsLen = ths.length;
      var offset = this.instance.blockedCols.count();

      while (thsLen > this.instance.colCount + offset) {
        //remove excessive cols
        thsLen--;
        $(tr.childNodes[thsLen]).remove();
      }

      for (h = 0; h < hlen; h++) {
        var realThs = this.instance.table.find('thead th.' + this.headers[h].className);
        for (var i = 0; i < thsLen; i++) {
          label = that.headers[h].columnLabel(i - offset);
          if (this.headers[h].format && this.headers[h].format === 'small') {
            realThs[i].innerHTML = this.headerText(label);
            ths[i].innerHTML = this.headerText(label);
          }
          else {
            realThs[i].innerHTML = label;
            ths[i].innerHTML = label;
          }
          this.instance.minWidthFix(realThs[i]);
          this.instance.minWidthFix(ths[i]);
          ths[i].style.minWidth = realThs.eq(i).width() + 'px';
        }
      }
    }

    this.ths = this.main.find('tr:last-child th');
    this.refreshBorders();
  }
};

/**
 * Refresh border width
 */
Handsontable.BlockedRows.prototype.refreshBorders = function () {
  if (this.count() > 0) {
    if (this.instance.curScrollTop === 0) {
      this.ths.css('borderBottomWidth', 0);
    }
    else if (this.instance.lastScrollTop === 0) {
      this.ths.css('borderBottomWidth', '1px');
    }
  }
};

/**
 * Recalculate column widths on the floating layer above the grid
 */
Handsontable.BlockedRows.prototype.dimensions = function () {
  if (this.count() > 0) {
    var realThs = this.instance.table.find('thead th');
    for (var i = 0, ilen = realThs.length; i < ilen; i++) {
      this.ths[i].style.minWidth = $(realThs[i]).width() + 'px';
    }
  }
};


/**
 * Update settings of the column header
 */
Handsontable.BlockedRows.prototype.update = function () {
  this.create();
  this.refresh();
};

/**
 * Add column header to DOM
 */
Handsontable.BlockedRows.prototype.addHeader = function (header) {
  for (var h = this.count() - 1; h >= 0; h--) {
    if (this.headers[h].className === header.className) {
      this.headers.splice(h, 1); //if exists, remove then add to recreate
    }
  }
  this.headers.push(header);
  this.headers.sort(function (a, b) {
    return a.priority || 0 - b.priority || 0
  });
  this.update();
};

/**
 * Remove column header from DOM
 */
Handsontable.BlockedRows.prototype.destroyHeader = function (className) {
  for (var h = this.count() - 1; h >= 0; h--) {
    if (this.headers[h].className === className) {
      this.main.find('thead tr.' + this.headers[h].className).remove();
      this.instance.table.find('thead tr.' + this.headers[h].className).remove();
      this.headers.splice(h, 1);
    }
  }
};

/**
 * Puts string to small text template
 */
Handsontable.BlockedRows.prototype.headerText = function (str) {
  return '&nbsp;<span class="small">' + str + '</span>&nbsp;';
};
/**
 * Handsontable BlockedCols class
 * @param {Object} instance
 */
Handsontable.BlockedCols = function (instance) {
  var that = this;
  this.instance = instance;
  this.headers = [];
  var position = instance.table.position();
  instance.positionFix(position);
  this.main = $('<div style="position: absolute; top: ' + position.top + 'px; left: ' + position.left + 'px"><table class="htBlockedCols" cellspacing="0" cellpadding="0"><thead><tr></tr></thead><tbody></tbody></table></div>');
  this.instance.container.append(this.main);
  this.heightMethod = this.determineCellHeightMethod();
  this.instance.rootElement.on('cellrender.handsontable', function (/*event, changes, source*/) {
    setTimeout(function () {
      that.dimensions();
    }, 10);
  });
};

/**
 * Determine cell height method
 * @return {String}
 */
Handsontable.BlockedCols.prototype.determineCellHeightMethod = function () {
  return 'height';
};

/**
 * Returns number of blocked cols
 */
Handsontable.BlockedCols.prototype.count = function () {
  return this.headers.length;
};

/**
 * Create row header in the grid table
 */
Handsontable.BlockedCols.prototype.createRow = function (tr) {
  var th;
  var mainTr = document.createElement('tr');

  for (var h = 0, hlen = this.count(); h < hlen; h++) {
    th = document.createElement('th');
    th.className = this.headers[h].className;
    this.instance.minWidthFix(th);
    tr.insertBefore(th, tr.firstChild);

    th = document.createElement('th');
    th.className = this.headers[h].className;
    mainTr.insertBefore(th, mainTr.firstChild);
  }

  this.main.find('tbody')[0].appendChild(mainTr);
};

/**
 * Create row header in the grid table
 */
Handsontable.BlockedCols.prototype.create = function () {
  var hlen = this.count(), h, th;
  this.main.find('tbody').empty();
  this.instance.table.find('tbody th').remove();
  var $theadTr = this.main.find('thead tr');
  $theadTr.empty();

  if (hlen > 0) {
    var offset = this.instance.blockedRows.count();
    if (offset) {
      for (h = 0; h < hlen; h++) {
        th = $theadTr[0].getElementsByClassName ? $theadTr[0].getElementsByClassName(this.headers[h].className)[0] : $theadTr.find('.' + this.headers[h].className.replace(/\s/i, '.'))[0];
        if (!th) {
          th = document.createElement('th');
          th.className = this.headers[h].className;
          th.innerHTML = this.headerText('&nbsp;');
          this.instance.minWidthFix(th);
          $theadTr[0].insertBefore(th, $theadTr[0].firstChild);
        }
      }
    }

    var trs = this.instance.table.find('tbody')[0].childNodes;
    for (var r = 0; r < this.instance.rowCount; r++) {
      this.createRow(trs[r]);
    }
  }
};

/**
 * Copy table row header onto the floating layer above the grid
 */
Handsontable.BlockedCols.prototype.refresh = function () {
  var hlen = this.count(), h, th, realTh, i, label;
  if (hlen > 0) {
    var $tbody = this.main.find('tbody');
    var tbody = $tbody[0];
    var trs = tbody.childNodes;
    var trsLen = trs.length;
    while (trsLen > this.instance.rowCount) {
      //remove excessive rows
      trsLen--;
      $(tbody.childNodes[trsLen]).remove();
    }

    var realTrs = this.instance.table.find('tbody tr');
    for (i = 0; i < trsLen; i++) {
      for (h = 0; h < hlen; h++) {
        label = this.headers[h].columnLabel(i);
        realTh = realTrs[i].getElementsByClassName ? realTrs[i].getElementsByClassName(this.headers[h].className)[0] : $(realTrs[i]).find('.' + this.headers[h].className.replace(/\s/i, '.'))[0];
        th = trs[i].getElementsByClassName ? trs[i].getElementsByClassName(this.headers[h].className)[0] : $(trs[i]).find('.' + this.headers[h].className.replace(/\s/i, '.'))[0];
        if (this.headers[h].format && this.headers[h].format === 'small') {
          realTh.innerHTML = this.headerText(label);
          th.innerHTML = this.headerText(label);
        }
        else {
          realTh.innerHTML = label;
          th.innerHTML = label;
        }
        this.instance.minWidthFix(th);
        th.style.height = $(realTh)[this.heightMethod]() + 'px';
      }
    }

    this.ths = this.main.find('th:last-child');
    this.refreshBorders();
  }
};

/**
 * Refresh border width
 */
Handsontable.BlockedCols.prototype.refreshBorders = function () {
  if (this.count() > 0) {
    if (this.instance.curScrollLeft === 0) {
      this.ths.css('borderRightWidth', 0);
    }
    else if (this.instance.lastScrollLeft === 0) {
      this.ths.css('borderRightWidth', '1px');
    }
  }
};

/**
 * Recalculate row heights on the floating layer above the grid
 */
Handsontable.BlockedCols.prototype.dimensions = function () {
  if (this.count() > 0) {
    var realTrs = this.instance.table[0].getElementsByTagName('tbody')[0].childNodes;
    var trs = this.main[0].firstChild.getElementsByTagName('tbody')[0].childNodes;
    for (var i = 0, ilen = realTrs.length; i < ilen; i++) {
      trs[i].firstChild.style.height = $(realTrs[i].firstChild)[this.heightMethod]() + 'px';
    }
  }
};

/**
 * Update settings of the row header
 */
Handsontable.BlockedCols.prototype.update = Handsontable.BlockedRows.prototype.update;

/**
 * Add row header to DOM
 */
Handsontable.BlockedCols.prototype.addHeader = function (header) {
  for (var h = this.count() - 1; h >= 0; h--) {
    if (this.headers[h].className === header.className) {
      this.headers.splice(h, 1); //if exists, remove then add to recreate
    }
  }
  this.headers.push(header);
  this.headers.sort(function (a, b) {
    return a.priority || 0 - b.priority || 0
  });
};

/**
 * Remove row header from DOM
 */
Handsontable.BlockedCols.prototype.destroyHeader = function (className) {
  for (var h = this.count() - 1; h >= 0; h--) {
    if (this.headers[h].className === className) {
      this.headers.splice(h, 1);
    }
  }
};

/**
 * Puts string to small text template
 */
Handsontable.BlockedCols.prototype.headerText = Handsontable.BlockedRows.prototype.headerText;
/**
 * Handsontable RowHeader extension
 * @param {Object} instance
 * @param {Array|Boolean} [labels]
 */
Handsontable.RowHeader = function (instance, labels) {
  var that = this;
  this.className = 'htRowHeader';
  instance.blockedCols.main.on('mousedown', 'th.htRowHeader', function (event) {
    if (!$(event.target).hasClass('btn') && !$(event.target).hasClass('btnContainer')) {
      instance.deselectCell();
      $(this).addClass('active');
      that.lastActive = this;
      var offset = instance.blockedRows.count();
      instance.selectCell(this.parentNode.rowIndex - offset, 0, this.parentNode.rowIndex - offset, instance.colCount - 1, false);
    }
  });
  instance.rootElement.on('deselect.handsontable', function () {
    that.deselect();
  });
  this.labels = labels;
  this.instance = instance;
  this.instance.rowHeader = this;
  this.format = 'small';
  instance.blockedCols.addHeader(this);
};

/**
 * Return custom row label or automatically generate one
 * @param {Number} index Row index
 * @return {String}
 */
Handsontable.RowHeader.prototype.columnLabel = function (index) {
  if (typeof this.labels[index] !== 'undefined') {
    return this.labels[index];
  }
  return index + 1;
};

/**
 * Remove current highlight of a currently selected row header
 */
Handsontable.RowHeader.prototype.deselect = function () {
  if (this.lastActive) {
    $(this.lastActive).removeClass('active');
    this.lastActive = null;
  }
};

/**
 *
 */
Handsontable.RowHeader.prototype.destroy = function () {
  this.instance.blockedCols.destroyHeader(this.className);
};
/**
 * Handsontable ColHeader extension
 * @param {Object} instance
 * @param {Array|Boolean} [labels]
 */
Handsontable.ColHeader = function (instance, labels) {
  var that = this;
  this.className = 'htColHeader';
  instance.blockedRows.main.on('mousedown', 'th.htColHeader', function () {
    instance.deselectCell();
    var $th = $(this);
    $th.addClass('active');
    that.lastActive = this;
    var index = $th.index();
    var offset = instance.blockedCols ? instance.blockedCols.count() : 0;
    instance.selectCell(0, index - offset, instance.rowCount - 1, index - offset, false);
  });
  instance.rootElement.on('deselect.handsontable', function () {
    that.deselect();
  });
  this.instance = instance;
  this.labels = labels;
  this.instance.colHeader = this;
  this.format = 'small';
  instance.blockedRows.addHeader(this);
};

/**
 * Return custom column label or automatically generate one
 * @param {Number} index Row index
 * @return {String}
 */
Handsontable.ColHeader.prototype.columnLabel = function (index) {
  if (typeof this.labels[index] !== 'undefined') {
    return this.labels[index];
  }
  var dividend = index + 1;
  var columnLabel = '';
  var modulo;
  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    columnLabel = String.fromCharCode(65 + modulo) + columnLabel;
    dividend = parseInt((dividend - modulo) / 26);
  }
  return columnLabel;
};

/**
 * Remove current highlight of a currently selected column header
 */
Handsontable.ColHeader.prototype.deselect = Handsontable.RowHeader.prototype.deselect;

/**
 *
 */
Handsontable.ColHeader.prototype.destroy = function () {
  this.instance.blockedRows.destroyHeader(this.className);
};
/**
 * Default text renderer
 * @param {Object} instance Handsontable instance
 * @param {Element} td Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Value to render (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properites (shared by cell renderer and editor)
 */
Handsontable.TextRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  var escaped = Handsontable.helper.stringify(value);
  escaped = escaped.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); //escape html special chars
  td.innerHTML = escaped.replace(/\n/g, '<br/>');
};
/**
 * Autocomplete renderer
 * @param {Object} instance Handsontable instance
 * @param {Element} td Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Value to render (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properites (shared by cell renderer and editor)
 */
Handsontable.AutocompleteRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  var $td = $(td);
  var $text = $('<div class="htAutocomplete"></div>');
  var $arrow = $('<div class="htAutocompleteArrow">&#x25BC;</div>');
  $arrow.mouseup(function(){
    $td.triggerHandler('dblclick.editor');
  });

  Handsontable.TextCell.renderer(instance, $text[0], row, col, prop, value, cellProperties);

  if($text.html() === '') {
    $text.html('&nbsp;');
  }

  $text.append($arrow);
  $td.empty().append($text);
};
/**
 * Checkbox renderer
 * @param {Object} instance Handsontable instance
 * @param {Element} td Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param value Value to render (remember to escape unsafe HTML before inserting to DOM!)
 * @param {Object} cellProperties Cell properites (shared by cell renderer and editor)
 */
Handsontable.CheckboxRenderer = function (instance, td, row, col, prop, value, cellProperties) {
  if (typeof cellProperties.checkedTemplate === "undefined") {
    cellProperties.checkedTemplate = true;
  }
  if (typeof cellProperties.uncheckedTemplate === "undefined") {
    cellProperties.uncheckedTemplate = false;
  }
  if (value === cellProperties.checkedTemplate || value === Handsontable.helper.stringify(cellProperties.checkedTemplate)) {
    td.innerHTML = "<input type='checkbox' checked autocomplete='no'>";
  }
  else if (value === cellProperties.uncheckedTemplate || value === Handsontable.helper.stringify(cellProperties.uncheckedTemplate)) {
    td.innerHTML = "<input type='checkbox' autocomplete='no'>";
  }
  else if (value === null) { //default value
    td.innerHTML = "<input type='checkbox' autocomplete='no' style='opacity: 0.5'>";
  }
  else {
    td.innerHTML = "#bad value#";
  }

  $(td).find('input').change(function () {
    if ($(this).is(':checked')) {
      instance.setDataAtCell(row, prop, cellProperties.checkedTemplate);
    }
    else {
      instance.setDataAtCell(row, prop, cellProperties.uncheckedTemplate);
    }
  });

  return td;
};
var texteditor = {
  isCellEdited: false,

  /**
   * Returns caret position in edit proxy
   * @author http://stackoverflow.com/questions/263743/how-to-get-caret-position-in-textarea
   * @return {Number}
   */
  getCaretPosition: function (keyboardProxy) {
    var el = keyboardProxy[0];
    if (el.selectionStart) {
      return el.selectionStart;
    }
    else if (document.selection) {
      el.focus();
      var r = document.selection.createRange();
      if (r == null) {
        return 0;
      }
      var re = el.createTextRange(),
        rc = re.duplicate();
      re.moveToBookmark(r.getBookmark());
      rc.setEndPoint('EndToStart', re);
      return rc.text.length;
    }
    return 0;
  },

  /**
   * Sets caret position in edit proxy
   * @author http://blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea/
   * @param {Number}
    */
  setCaretPosition: function (keyboardProxy, pos) {
    var el = keyboardProxy[0];
    if (el.setSelectionRange) {
      el.focus();
      el.setSelectionRange(pos, pos);
    }
    else if (el.createTextRange) {
      var range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  },

  /**
   * Shows text input in grid cell
   */
  beginEditing: function (instance, td, row, col, prop, keyboardProxy, useOriginalValue, suffix) {
    if (texteditor.isCellEdited) {
      return;
    }

    keyboardProxy.on('cut.editor', function (event) {
      event.stopPropagation();
    });

    keyboardProxy.on('paste.editor', function (event) {
      event.stopPropagation();
    });

    var $td = $(td);

    if (!instance.getCellMeta(row, col).isWritable) {
      return;
    }

    texteditor.isCellEdited = true;

    if (useOriginalValue) {
      var original = instance.getDataAtCell(row, prop);
      original = Handsontable.helper.stringify(original) + (suffix || '');
      keyboardProxy.val(original);
      texteditor.setCaretPosition(keyboardProxy, original.length);
    }
    else {
      keyboardProxy.val('');
    }

    var width = $td.width()
      , height = $td.outerHeight() - 4;

    if (parseInt($td.css('border-top-width')) > 0) {
      height -= 1;
    }
    if (parseInt($td.css('border-left-width')) > 0) {
      if (instance.blockedCols.count() > 0) {
        width -= 1;
      }
    }

    keyboardProxy.autoResize({
      maxHeight: 200,
      minHeight: height,
      minWidth: width,
      maxWidth: Math.max(168, width),
      animate: false,
      extraSpace: 0
    });
    keyboardProxy.parent().removeClass('htHidden');

    instance.rootElement.triggerHandler('beginediting.handsontable');

    setTimeout(function () {
      //async fix for Firefox 3.6.28 (needs manual testing)
      keyboardProxy.parent().css({
        overflow: 'visible'
      });
    }, 1);
  },

  /**
   * Finishes text input in selected cells
   */
  finishEditing: function (instance, td, row, col, prop, keyboardProxy, isCancelled, ctrlDown) {
    if (texteditor.isCellEdited) {
      texteditor.isCellEdited = false;
      var val = [
        [$.trim(keyboardProxy.val())]
      ];
      if (!isCancelled) {
        if (ctrlDown) { //if ctrl+enter and multiple cells selected, behave like Excel (finish editing and apply to all cells)
          var sel = instance.handsontable('getSelected');
          instance.populateFromArray({row: sel[0], col: sel[1]}, val, {row: sel[2], col: sel[3]}, false, 'edit');
        }
        else {
          instance.populateFromArray({row: row, col: col}, val, null, false, 'edit');
        }
        keyboardProxy.off(".editor");
        $(td).off('.editor');
      }
    }
    else {
      keyboardProxy.off(".editor");
      $(td).off('.editor');
    }

    keyboardProxy.css({
      width: 0,
      height: 0
    });
    keyboardProxy.parent().addClass('htHidden').css({
      overflow: 'hidden'
    });

    instance.container.find('.htBorder.current').off('.editor');
    instance.rootElement.triggerHandler('finishediting.handsontable');
  }
};

/**
 * Default text editor
 * @param {Object} instance Handsontable instance
 * @param {Element} td Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param {Object} keyboardProxy jQuery element of keyboard proxy that contains current editing value
 * @param {Object} cellProperties Cell properites (shared by cell renderer and editor)
 */
Handsontable.TextEditor = function (instance, td, row, col, prop, keyboardProxy, cellProperties) {
  texteditor.isCellEdited = false;

  var $current = $(td);
  var currentOffset = $current.offset();
  var containerOffset = instance.container.offset();
  var scrollTop = instance.container.scrollTop();
  var scrollLeft = instance.container.scrollLeft();
  var editTop = currentOffset.top - containerOffset.top + scrollTop - 1;
  var editLeft = currentOffset.left - containerOffset.left + scrollLeft - 1;

  if (editTop < 0) {
    editTop = 0;
  }
  if (editLeft < 0) {
    editLeft = 0;
  }

  if (instance.blockedRows.count() > 0 && parseInt($current.css('border-top-width')) > 0) {
    editTop += 1;
  }
  if (instance.blockedCols.count() > 0 && parseInt($current.css('border-left-width')) > 0) {
    editLeft += 1;
  }

  if ($.browser.msie && parseInt($.browser.version, 10) <= 7) {
    editTop -= 1;
  }

  keyboardProxy.parent().addClass('htHidden').css({
    top: editTop,
    left: editLeft,
    overflow: 'hidden'
  });
  keyboardProxy.css({
    width: 0,
    height: 0
  });

  keyboardProxy.on("keydown.editor", function (event) {
    var ctrlDown = (event.ctrlKey || event.metaKey) && !event.altKey; //catch CTRL but not right ALT (which in some systems triggers ALT+CTRL)
    if (Handsontable.helper.isPrintableChar(event.keyCode)) {
      if (!texteditor.isCellEdited && !ctrlDown) { //disregard CTRL-key shortcuts
        texteditor.beginEditing(instance, td, row, col, prop, keyboardProxy);
        event.stopImmediatePropagation();
      }
      else if (ctrlDown) {
        if (texteditor.isCellEdited && event.keyCode === 65) { //CTRL + A
          event.stopPropagation();
        }
        else if (texteditor.isCellEdited && event.keyCode === 88 && $.browser.opera) { //CTRL + X
          event.stopPropagation();
        }
        else if (texteditor.isCellEdited && event.keyCode === 86 && $.browser.opera) { //CTRL + V
          event.stopPropagation();
        }
      }
      return;
    }

    switch (event.keyCode) {
      case 38: /* arrow up */
        if (texteditor.isCellEdited) {
          texteditor.finishEditing(instance, td, row, col, prop, keyboardProxy, false);
          event.stopPropagation();
        }
        break;

      case 9: /* tab */
        if (texteditor.isCellEdited) {
          texteditor.finishEditing(instance, td, row, col, prop, keyboardProxy, false);
          event.stopPropagation();
        }
        event.preventDefault();
        break;

      case 39: /* arrow right */
        if (texteditor.isCellEdited) {
          if (texteditor.getCaretPosition(keyboardProxy) === keyboardProxy.val().length) {
            texteditor.finishEditing(instance, td, row, col, prop, keyboardProxy, false);

          }
          else {
            event.stopPropagation();
          }
        }
        break;

      case 37: /* arrow left */
        if (texteditor.isCellEdited) {
          if (texteditor.getCaretPosition(keyboardProxy) === 0) {
            texteditor.finishEditing(instance, td, row, col, prop, keyboardProxy, false);
          }
          else {
            event.stopPropagation();
          }
        }
        break;

      case 8: /* backspace */
      case 46: /* delete */
        if (texteditor.isCellEdited) {
          event.stopPropagation();
        }
        break;

      case 40: /* arrow down */
        if (texteditor.isCellEdited) {
          texteditor.finishEditing(instance, td, row, col, prop, keyboardProxy, false);
          event.stopPropagation();
        }
        break;

      case 27: /* ESC */
        if (texteditor.isCellEdited) {
          texteditor.finishEditing(instance, td, row, col, prop, keyboardProxy, true); //hide edit field, restore old value, don't move selection, but refresh routines
          event.stopPropagation();
        }
        break;

      case 113: /* F2 */
        if (!texteditor.isCellEdited) {
          texteditor.beginEditing(instance, td, row, col, prop, keyboardProxy, true); //show edit field
          event.stopPropagation();
          event.preventDefault(); //prevent Opera from opening Go to Page dialog
        }
        break;

      case 13: /* return/enter */
        if (texteditor.isCellEdited) {
          var selected = instance.getSelected();
          var isMultipleSelection = !(selected[0] === selected[2] && selected[1] === selected[3]);
          if ((event.ctrlKey && !isMultipleSelection) || event.altKey) { //if ctrl+enter or alt+enter, add new line
            keyboardProxy.val(keyboardProxy.val() + '\n');
            keyboardProxy[0].focus();
            event.stopPropagation();
          }
          else {
            texteditor.finishEditing(instance, td, row, col, prop, keyboardProxy, false, ctrlDown);
          }
        }
        else if (instance.getSettings().enterBeginsEditing) {
          if ((ctrlDown && !selection.isMultiple()) || event.altKey) { //if ctrl+enter or alt+enter, add new line
            texteditor.beginEditing(instance, td, row, col, prop, keyboardProxy, true, '\n'); //show edit field
          }
          else {
            texteditor.beginEditing(instance, td, row, col, prop, keyboardProxy, true); //show edit field
          }
          event.stopPropagation();
        }
        event.preventDefault(); //don't add newline to field
        break;

      case 36: /* home */
        event.stopPropagation();
        break;

      case 35: /* end */
        event.stopPropagation();
        break;
    }
  });

  function onDblClick() {
    keyboardProxy[0].focus();
    texteditor.beginEditing(instance, td, row, col, prop, keyboardProxy, true);
  }

  $current.on('dblclick.editor', onDblClick);
  instance.container.find('.htBorder.current').on('dblclick.editor', onDblClick);

  return function (isCancelled) {
    texteditor.finishEditing(instance, td, row, col, prop, keyboardProxy, isCancelled);
  }
};
function isAutoComplete(keyboardProxy) {
  var typeahead = keyboardProxy.data("typeahead");
  if (typeahead && typeahead.$menu.is(":visible")) {
    return typeahead;
  }
  else {
    return false;
  }
}

/**
 * Copied from bootstrap-typeahead.js for reference
 */
function defaultAutoCompleteHighlighter(item) {
  var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
    return '<strong>' + match + '</strong>';
  })
}

/**
 * Autocomplete editor
 * @param {Object} instance Handsontable instance
 * @param {Element} td Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param {Object} keyboardProxy jQuery element of keyboard proxy that contains current editing value
 * @param {Object} cellProperties Cell properites (shared by cell renderer and editor)
 */
Handsontable.AutocompleteEditor = function (instance, td, row, col, prop, keyboardProxy, cellProperties) {
  var typeahead = keyboardProxy.data('typeahead')
    , dontHide = false;

  if (!typeahead) {
    keyboardProxy.typeahead();
    typeahead = keyboardProxy.data('typeahead');
  }

  typeahead.minLength = 0;
  typeahead.source = cellProperties.autoComplete.source(row, col);
  typeahead.highlighter = cellProperties.autoComplete.highlighter || defaultAutoCompleteHighlighter;

  if (!typeahead._show) {
    typeahead._show = typeahead.show;
    typeahead._hide = typeahead.hide;
    typeahead._render = typeahead.render;
  }

  typeahead.show = function () {
    if (keyboardProxy.parent().hasClass('htHidden')) {
      return;
    }
    return typeahead._show.call(this);
  };

  typeahead.hide = function () {
    if (!dontHide) {
      dontHide = false;
      return typeahead._hide.call(this);
    }
  };

  typeahead.lookup = function () {
    var items;
    this.query = this.$element.val();
    items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;
    return items ? this.process(items) : this;
  };

  typeahead.matcher = function () {
    return true;
  };

  typeahead.select = function () {
    var val = this.$menu.find('.active').attr('data-value') || keyboardProxy.val();
    destroyer(true);
    instance.setDataAtCell(row, prop, typeahead.updater(val));
    return this.hide();
  };

  typeahead.render = function (items) {
    typeahead._render.call(this, items);
    if (cellProperties.autoComplete.strict) {
      this.$menu.find('li:eq(0)').removeClass('active');
    }
    return this;
  };

  keyboardProxy.on("keydown.editor", function (event) {
    switch (event.keyCode) {
      case 38: /* arrow up */
      case 40: /* arrow down */
      case 9: /* tab */
      case 13: /* return/enter */
        if (isAutoComplete(keyboardProxy)) {
          event.stopImmediatePropagation();
        }
        event.preventDefault();
    }
  });

  keyboardProxy.on("keyup.editor", function (event) {
      switch (event.keyCode) {
        case 9: /* tab */
        case 13: /* return/enter */
          if (!isAutoComplete(keyboardProxy)) {
            var ev = $.Event('keyup');
            ev.keyCode = 113; //113 triggers lookup, in contrary to 13 or 9 which only trigger hide
            keyboardProxy.trigger(ev);
          }
          else {
            setTimeout(function () { //so pressing enter will move one row down after change is applied by 'select' above
              var ev = $.Event('keydown');
              ev.keyCode = event.keyCode;
              keyboardProxy.parent().trigger(ev);
            }, 10);
          }
          break;

        default:
          if (!Handsontable.helper.isPrintableChar(event.keyCode)) { //otherwise Del or F12 would open suggestions list
            event.stopImmediatePropagation();
          }
      }
    }
  );

  var textDestroyer = Handsontable.TextEditor(instance, td, row, col, prop, keyboardProxy, cellProperties);

  function onDblClick() {
    dontHide = true;
    setTimeout(function () { //otherwise is misaligned in IE9
      keyboardProxy.data('typeahead').lookup();
    }, 1);
  }

  $(td).on('dblclick.editor', onDblClick);
  instance.container.find('.htBorder.current').on('dblclick.editor', onDblClick);

  var destroyer = function (isCancelled) {
    textDestroyer(isCancelled);
    typeahead.source = [];
    if (isAutoComplete(keyboardProxy) && isAutoComplete(keyboardProxy).shown) {
      isAutoComplete(keyboardProxy).hide();
    }
  };

  return destroyer;
};
function toggleCheckboxCell(instance, row, prop, cellProperties) {
  if (Handsontable.helper.stringify(instance.getDataAtCell(row, prop)) === Handsontable.helper.stringify(cellProperties.checkedTemplate)) {
    instance.setDataAtCell(row, prop, cellProperties.uncheckedTemplate);
  }
  else {
    instance.setDataAtCell(row, prop, cellProperties.checkedTemplate);
  }
}

/**
 * Checkbox editor
 * @param {Object} instance Handsontable instance
 * @param {Element} td Table cell where to render
 * @param {Number} row
 * @param {Number} col
 * @param {String|Number} prop Row object property name
 * @param {Object} keyboardProxy jQuery element of keyboard proxy that contains current editing value
 * @param {Object} cellProperties Cell properites (shared by cell renderer and editor)
 */
Handsontable.CheckboxEditor = function (instance, td, row, col, prop, keyboardProxy, cellProperties) {
  if (typeof cellProperties === "undefined") {
    cellProperties = {};
  }
  if (typeof cellProperties.checkedTemplate === "undefined") {
    cellProperties.checkedTemplate = true;
  }
  if (typeof cellProperties.uncheckedTemplate === "undefined") {
    cellProperties.uncheckedTemplate = false;
  }

  keyboardProxy.on("keydown.editor", function (event) {
    if (Handsontable.helper.isPrintableChar(event.keyCode)) {
      toggleCheckboxCell(instance, row, prop, cellProperties);
      event.stopPropagation();
    }
  });

  function onDblClick() {
    toggleCheckboxCell(instance, row, prop, cellProperties);
  }

  var $td = $(td);
  $td.on('dblclick.editor', onDblClick);
  instance.container.find('.htBorder.current').on('dblclick.editor', onDblClick);

  return function () {
    keyboardProxy.off(".editor");
    $td.off(".editor");
    instance.container.find('.htBorder.current').off(".editor");
  }
};
Handsontable.AutocompleteCell = {
  renderer: Handsontable.AutocompleteRenderer,
  editor: Handsontable.AutocompleteEditor
};

Handsontable.CheckboxCell = {
  renderer: Handsontable.CheckboxRenderer,
  editor: Handsontable.CheckboxEditor
};

Handsontable.TextCell = {
  renderer: Handsontable.TextRenderer,
  editor: Handsontable.TextEditor
};
Handsontable.PluginHooks = {
  hooks: {
    afterInit: []
  },

  push: function(hook, fn){
    this.hooks[hook].push(fn);
  },

  unshift: function(hook, fn){
    this.hooks[hook].unshift(fn);
  },

  run: function(instance, hook){
    for(var i = 0, ilen = this.hooks[hook].length; i<ilen; i++) {
      this.hooks[hook][i].apply(instance);
    }
  }
};
function createContextMenu() {
  var instance = this
    , defaultOptions = {
      selector: "#" + instance.rootElement.attr('id') + ' table, #' + instance.rootElement.attr('id') + ' div',
      trigger: 'right',
      callback: onContextClick
    },
    allItems = {
      "row_above": {name: "Insert row above", disabled: isDisabled},
      "row_below": {name: "Insert row below", disabled: isDisabled},
      "hsep1": "---------",
      "col_left": {name: "Insert column on the left", disabled: isDisabled},
      "col_right": {name: "Insert column on the right", disabled: isDisabled},
      "hsep2": "---------",
      "remove_row": {name: "Remove row", disabled: isDisabled},
      "remove_col": {name: "Remove column", disabled: isDisabled},
      "hsep3": "---------",
      "undo": {name: "Undo", disabled: function () {
        return !instance.isUndoAvailable();
      }},
      "redo": {name: "Redo", disabled: function () {
        return !instance.isRedoAvailable();
      }}
    }
    , options = {}
    , i
    , ilen
    , settings = instance.getSettings();

  function onContextClick(key) {
    var corners = instance.getSelected(); //[top left row, top left col, bottom right row, bottom right col]

    switch (key) {
      case "row_above":
        instance.alter("insert_row", corners[0]);
        break;

      case "row_below":
        instance.alter("insert_row", corners[2] + 1);
        break;

      case "col_left":
        instance.alter("insert_col", corners[1]);
        break;

      case "col_right":
        instance.alter("insert_col", corners[3] + 1);
        break;

      case "remove_row":
        instance.alter(key, corners[0], corners[2]);
        break;

      case "remove_col":
        instance.alter(key, corners[1], corners[3]);
        break;

      case "undo":
        instance.undo();
        break;

      case "redo":
        instance.redo();
        break;
    }
  }

  function isDisabled(key) {
    if (instance.blockedCols.main.find('th.htRowHeader.active').length && (key === "remove_col" || key === "col_left" || key === "col_right")) {
      return true;
    }
    else if (instance.blockedRows.main.find('th.htColHeader.active').length && (key === "remove_row" || key === "row_above" || key === "row_below")) {
      return true;
    }
    else {
      return false;
    }
  }

  if (!settings.contextMenu) {
    return;
  }
  else if (settings.contextMenu === true) { //contextMenu is true
    options.items = allItems;
  }
  else if (Object.prototype.toString.apply(settings.contextMenu) === '[object Array]') { //contextMenu is an array
    options.items = {};
    for (i = 0, ilen = settings.contextMenu.length; i < ilen; i++) {
      var key = settings.contextMenu[i];
      if (typeof allItems[key] === 'undefined') {
        throw new Error('Context menu key "' + key + '" is not recognised');
      }
      options.items[key] = allItems[key];
    }
  }
  else if (Object.prototype.toString.apply(settings.contextMenu) === '[object Object]') { //contextMenu is an options object as defined in http://medialize.github.com/jQuery-contextMenu/docs.html
    options = settings.contextMenu;
    if (options.items) {
      for (i in options.items) {
        if (options.items.hasOwnProperty(i) && allItems[i]) {
          if (typeof options.items[i] === 'string') {
            options.items[i] = allItems[i];
          }
          else {
            options.items[i] = $.extend(true, allItems[i], options.items[i]);
          }
        }
      }
    }
    else {
      options.items = allItems;
    }

    if (options.callback) {
      var handsontableCallback = defaultOptions.callback;
      var customCallback = options.callback;
      options.callback = function (key, options) {
        handsontableCallback(key, options);
        customCallback(key, options);
      }
    }
  }

  if (!instance.rootElement.attr('id')) {
    throw new Error("Handsontable container must have an id");
  }

  $.contextMenu($.extend(true, defaultOptions, options));
}

Handsontable.PluginHooks.push('afterInit', createContextMenu);
/*
 * jQuery.fn.autoResize 1.1
 * --
 * https://github.com/jamespadolsey/jQuery.fn.autoResize
 * --
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */

(function($){

  autoResize.defaults = {
    onResize: function(){},
    animate: {
      duration: 200,
      complete: function(){}
    },
    extraSpace: 50,
    minHeight: 'original',
    maxHeight: 500,
    minWidth: 'original',
    maxWidth: 500
  };

  autoResize.cloneCSSProperties = [
    'lineHeight', 'textDecoration', 'letterSpacing',
    'fontSize', 'fontFamily', 'fontStyle', 'fontWeight',
    'textTransform', 'textAlign', 'direction', 'wordSpacing', 'fontSizeAdjust',
    'padding'
  ];

  autoResize.cloneCSSValues = {
    position: 'absolute',
    top: -9999,
    left: -9999,
    opacity: 0,
    overflow: 'hidden',
    border: '1px solid black',
    padding: '0.49em' //this must be about the width of caps W character
  };

  autoResize.resizableFilterSelector = 'textarea,input:not(input[type]),input[type=text],input[type=password]';

  autoResize.AutoResizer = AutoResizer;

  $.fn.autoResize = autoResize;

  function autoResize(config) {
    this.filter(autoResize.resizableFilterSelector).each(function(){
      new AutoResizer( $(this), config );
    });
    return this;
  }

  function AutoResizer(el, config) {

    if(this.clones) return;

    this.config = $.extend({}, autoResize.defaults, config);

    this.el = el;

    this.nodeName = el[0].nodeName.toLowerCase();

    this.previousScrollTop = null;

    if (config.maxWidth === 'original') config.maxWidth = el.width();
    if (config.minWidth === 'original') config.minWidth = el.width();
    if (config.maxHeight === 'original') config.maxHeight = el.height();
    if (config.minHeight === 'original') config.minHeight = el.height();

    if (this.nodeName === 'textarea') {
      el.css({
        resize: 'none',
        overflowY: 'hidden'
      });
    }

    el.data('AutoResizer', this);

    this.createClone();
    this.injectClone();
    this.bind();

  }

  AutoResizer.prototype = {

    bind: function() {

      var check = $.proxy(function(){
        this.check();
        return true;
      }, this);

      this.unbind();

      this.el
        .bind('keyup.autoResize', check)
        //.bind('keydown.autoResize', check)
        .bind('change.autoResize', check);

      this.check(null, true);

    },

    unbind: function() {
      this.el.unbind('.autoResize');
    },

    createClone: function() {

      var el = this.el,
        self = this,
        config = this.config;

      this.clones = $();

      if (config.minHeight !== 'original' || config.maxHeight !== 'original') {
        this.hClone = el.clone().height('auto');
        this.clones = this.clones.add(this.hClone);
      }
      if (config.minWidth !== 'original' || config.maxWidth !== 'original') {
        this.wClone = $('<div/>').width('auto').css({
          whiteSpace: 'nowrap',
          float: 'left'
        });
        this.clones = this.clones.add(this.wClone);
      }

      $.each(autoResize.cloneCSSProperties, function(i, p){
        self.clones.css(p, el.css(p));
      });

      this.clones
        .removeAttr('name')
        .removeAttr('id')
        .attr('tabIndex', -1)
        .css(autoResize.cloneCSSValues);

    },

    check: function(e, immediate) {

      var config = this.config,
        wClone = this.wClone,
        hClone = this.hClone,
        el = this.el,
        value = el.val();

      if (wClone) {

        wClone.text(value);

        // Calculate new width + whether to change
        var cloneWidth = wClone.outerWidth(),
          newWidth = (cloneWidth + config.extraSpace) >= config.minWidth ?
            cloneWidth + config.extraSpace : config.minWidth,
          currentWidth = el.width();

        newWidth = Math.min(newWidth, config.maxWidth);

        if (
          (newWidth < currentWidth && newWidth >= config.minWidth) ||
            (newWidth >= config.minWidth && newWidth <= config.maxWidth)
          ) {

          config.onResize.call(el);

          el.scrollLeft(0);

          config.animate && !immediate ?
            el.stop(1,1).animate({
              width: newWidth
            }, config.animate)
            : el.width(newWidth);

        }

      }

      if (hClone) {

        if (newWidth) {
          hClone.width(newWidth);
        }

        hClone.height(0).val(value).scrollTop(10000);

        var scrollTop = hClone[0].scrollTop + config.extraSpace;

        // Don't do anything if scrollTop hasen't changed:
        if (this.previousScrollTop === scrollTop) {
          return;
        }

        this.previousScrollTop = scrollTop;

        if (scrollTop >= config.maxHeight) {
          el.css('overflowY', '');
          return;
        }

        el.css('overflowY', 'hidden');

        if (scrollTop < config.minHeight) {
          scrollTop = config.minHeight;
        }

        config.onResize.call(el);

        // Either animate or directly apply height:
        config.animate && !immediate ?
          el.stop(1,1).animate({
            height: scrollTop
          }, config.animate)
          : el.height(scrollTop);
      }
    },

    destroy: function() {
      this.unbind();
      this.el.removeData('AutoResizer');
      this.clones.remove();
      delete this.el;
      delete this.hClone;
      delete this.wClone;
      delete this.clones;
    },

    injectClone: function() {
      (
        autoResize.cloneContainer ||
          (autoResize.cloneContainer = $('<arclones/>').appendTo('body'))
        ).append(this.clones);
    }

  };

})(jQuery);
/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);

})(jQuery, window, Handsontable);