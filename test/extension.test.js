const assert = require('assert');
const vscode = require('vscode');

suite('CSS Variable Autocomplete Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Should provide CSS variable suggestions on var(', async () => {
        const doc = await vscode.workspace.openTextDocument({
            content: 'body { color: var(',
            language: 'css'
        });
        await vscode.window.showTextDocument(doc);

        // 定位到 var( 后，并获取补全项
        const position = new vscode.Position(0, 15);
        const completionList = await vscode.commands.executeCommand(
            'vscode.executeCompletionItemProvider',
            doc.uri,
            position
        );

        // 检查补全列表中是否包含自定义的 CSS 变量
        assert.ok(completionList, 'The completion list should exist');
        const variableCompletion = completionList.items.find(item => item.label === '--primary-color');
        assert.ok(variableCompletion, 'The list of completions should contain --primary-color');
    });
});
