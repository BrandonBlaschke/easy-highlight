// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// TODO: Remove all console.log statements

let activeEditor: vscode.TextEditor | undefined = undefined;
const defaultColor = '#fdff322f';

// TODO: File keys shouldn't be based on URI incase files change location
// Editors that have been marked
const markedEditors = new Map<string, Map<string, {ranges: vscode.Range[], decoration: vscode.TextEditorDecorationType}>>();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Highlight');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('easy-highlight.Highlight', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		// vscode.window.showInformationMessage('Easy Highlight!');
		
		// Get current text editor that is open and their selection
		activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			return;
		}

		// Get values from user
		const uri = activeEditor.document.uri.toString();
		let start = activeEditor.selection.start;
		let end = activeEditor.selection.end;

		// Create range
		let startPos = new vscode.Position(start.line, start.character);
		let endPos = new vscode.Position(end.line, end.character);
		let range = new vscode.Range(startPos, endPos);
		
		// Create range key
		const rangeKey = `${start.line}${start.character}${end.line}${end.character}`;

		if (!markedEditors.has(uri)) {
			markedEditors.set(uri, new Map<string, {ranges: vscode.Range[], decoration: vscode.TextEditorDecorationType}>());
		}

		const rangeMap = markedEditors.get(uri)!;

		const decoration = vscode.window.createTextEditorDecorationType({
			backgroundColor: defaultColor,
		});

		// If range already exist update decoration else add new one
		if (rangeMap.has(rangeKey)) {
			let hlObject = rangeMap.get(rangeKey)!;
			hlObject.decoration = decoration;
		} else {
			rangeMap.set(rangeKey, {ranges: [range], decoration});
		}

		updateDecorations(activeEditor);
	});

	// TODO: Dispose of the highlight that matches that line and spice it or something
	let disposableNoHighlight = vscode.commands.registerCommand("easy-highlight.RemoveHighlight", () => {
		
		console.log('Remove Highlight');

		// Get current text editor that is open and their selection
		// activeEditor = vscode.window.activeTextEditor;
		// if (!activeEditor) {
		// 	return;
		// }

		// const uri = activeEditor.document.uri.toString();
		// let start = activeEditor.selection.start;
		// let end = activeEditor.selection.end;

		// // Create range
		// let startPos = new vscode.Position(start.line, start.character);
		// let endPos = new vscode.Position(end.line, end.character);
		// let range = new vscode.Range(startPos, endPos);

		// if (markedEditors.has(uri)) {
		// 	markedEditors.get(uri)?.push(range);
		// } else {
		// 	markedEditors.set(uri, [range]);
		// }

		// updateDecorations(noHighlightDecorator);
	});

	// Disposes of all highlights on a single text editor
	let disposableRemoveAll = vscode.commands.registerCommand("easy-highlight.RemoveAllHighlights", () => {
		console.log("Remove all highlights");

		if (!activeEditor) {
			return;
		}

		const uri = activeEditor.document.uri.toString();

		if (!markedEditors.has(uri)) {
			return; 
		}

		markedEditors.get(uri)?.forEach((val, key) => {
			val.decoration.dispose();
			val.ranges = [];
		});
	});

	// Updates Decorations on current ActiveEditor
	let updateDecorations = (activeEditor: vscode.TextEditor) => {

		const uri = activeEditor.document.uri.toString();
		if (!markedEditors.has(uri)) {
			return;
		}

		markedEditors.get(uri)?.forEach((val, key) => {
			activeEditor.setDecorations(val.decoration!, val.ranges!);
		});
	};

	// When editor switches udpate activeEditor and udpate decorations.
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			updateDecorations(editor);
		}
	}, null, context.subscriptions);

	// When editor switches text documents update ActiveEditor and decorations.
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			updateDecorations(activeEditor);
		}
	}, null, context.subscriptions);

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposableNoHighlight);
	context.subscriptions.push(disposableRemoveAll);
}

// this method is called when your extension is deactivated
export function deactivate() {}