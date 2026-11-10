(function(exports, _wordpress_is_shallow_equal) {

"use strict";
// packages/undo-manager/build-module/index.mjs
/**
	* Merge changes for a single item into a record of changes.
	*
	* @param changes1 Previous changes
	* @param changes2 Next changes
	*
	* @return Merged changes
	*/
	function mergeHistoryChanges(changes1, changes2) {
		const newChanges = { ...changes1 };
		Object.entries(changes2).forEach(([key, value]) => {
			if (newChanges[key]) newChanges[key] = {
				...newChanges[key],
				to: value.to
			};
			else newChanges[key] = value;
		});
		return newChanges;
	}
	/**
	* Adds history changes for a single item into a record of changes.
	*
	* @param record  The record to merge into.
	* @param changes The changes to merge.
	*/
	const addHistoryChangesIntoRecord = (record, changes) => {
		const existingChangesIndex = record?.findIndex(({ id: recordIdentifier }) => {
			return typeof recordIdentifier === "string" ? recordIdentifier === changes.id : (0, _wordpress_is_shallow_equal.isShallowEqual)(recordIdentifier, changes.id);
		});
		const nextRecord = [...record];
		if (existingChangesIndex !== -1) nextRecord[existingChangesIndex] = {
			id: changes.id,
			changes: mergeHistoryChanges(nextRecord[existingChangesIndex].changes, changes.changes)
		};
		else nextRecord.push(changes);
		return nextRecord;
	};
	/**
	* Creates an undo manager.
	*
	* @return Undo manager.
	*/
	function createUndoManager() {
		let history = [];
		let stagedRecord = [];
		let offset = 0;
		const dropPendingRedos = () => {
			history = history.slice(0, offset || void 0);
			offset = 0;
		};
		const appendStagedRecordToLatestHistoryRecord = () => {
			const index = history.length === 0 ? 0 : history.length - 1;
			let latestRecord = history[index] ?? [];
			stagedRecord.forEach((changes) => {
				latestRecord = addHistoryChangesIntoRecord(latestRecord, changes);
			});
			stagedRecord = [];
			history[index] = latestRecord;
		};
		/**
		* Checks whether a record is empty.
		* A record is considered empty if it the changes keep the same values.
		* Also updates to function values are ignored.
		*
		* @param record The record to check.
		* @return Whether the record is empty.
		*/
		const isRecordEmpty = (record) => {
			return !record.filter(({ changes }) => {
				return Object.values(changes).some(({ from, to }) => typeof from !== "function" && typeof to !== "function" && !(0, _wordpress_is_shallow_equal.isShallowEqual)(from, to));
			}).length;
		};
		return {
			addRecord(record, isStaged = false) {
				const isEmpty = !record || isRecordEmpty(record);
				if (isStaged) {
					if (isEmpty) return;
					record.forEach((changes) => {
						stagedRecord = addHistoryChangesIntoRecord(stagedRecord, changes);
					});
				} else {
					dropPendingRedos();
					if (stagedRecord.length) appendStagedRecordToLatestHistoryRecord();
					if (isEmpty) return;
					history.push(record);
				}
			},
			undo() {
				if (stagedRecord.length) {
					dropPendingRedos();
					appendStagedRecordToLatestHistoryRecord();
				}
				const undoRecord = history[history.length - 1 + offset];
				if (!undoRecord) return;
				offset -= 1;
				return undoRecord;
			},
			redo() {
				const redoRecord = history[history.length + offset];
				if (!redoRecord) return;
				offset += 1;
				return redoRecord;
			},
			hasUndo() {
				return !!history[history.length - 1 + offset];
			},
			hasRedo() {
				return !!history[history.length + offset];
			}
		};
	}

exports.createUndoManager = createUndoManager;
Object.defineProperty(exports, '__esModule', { value: true });
(window.wp ||= {}).undoManager = exports;
return exports;
})({}, window.wp.isShallowEqual);
//# sourceMappingURL=index.js.map