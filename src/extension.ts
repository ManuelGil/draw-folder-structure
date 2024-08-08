import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getPrefix } from "./functions/get-prefix";
import { generateStructure } from "./functions/generate-structure";
import { Style } from "./types/style";

const CURRENT_VERSION = "1.3.0";

export function activate(context: vscode.ExtensionContext) {
  const previousVersion = context.globalState.get<string>("extensionVersion");

  if (previousVersion !== CURRENT_VERSION) {
    vscode.window.showInformationMessage(
      `🎉 New version ${CURRENT_VERSION} available! Check out the new features!`
    );
    context.globalState.update("extensionVersion", CURRENT_VERSION);
  }

  let disposable = vscode.commands.registerCommand(
    "extension.generateMarkdownStructure",
    async (folder: vscode.Uri) => {
      const folderPath = folder.fsPath;
      const itemName = path.basename(folderPath);
      const stats = fs.statSync(folderPath);
      let markdownStructure = "";

      const excludePatterns: string[] =
        vscode.workspace
          .getConfiguration("draw.folder.structure")
          .get("exclude") || [];

      const style: Style =
        vscode.workspace
          .getConfiguration("draw.folder.structure")
          .get("style") || Style.EmojiDashes;

      if (stats.isDirectory()) {
        markdownStructure += getPrefix(0, style) + itemName + "\n";
        markdownStructure += await generateStructure(
          folderPath,
          1,
          excludePatterns,
          style
        );
      } else {
        markdownStructure = getPrefix(0, style, true) + itemName + "\n";
      }

      markdownStructure = "```\n" + markdownStructure + "```";

      vscode.env.clipboard.writeText(markdownStructure).then(() => {
        // Muestra una notificación
        vscode.window.showInformationMessage(
          "Markdown structure copied to clipboard!"
        );
      });

      vscode.workspace
        .openTextDocument({ content: markdownStructure, language: "markdown" })
        .then((doc) => {
          vscode.window.showTextDocument(doc);
        });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
