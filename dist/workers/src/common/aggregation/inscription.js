"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InscriptionOps = void 0;
var InscriptionOps = /** @class */ (function () {
    function InscriptionOps() {
    }
    InscriptionOps.inscribeText = function (inputText, placeholder, replacementText) {
        return inputText.replace(placeholder, replacementText);
    };
    InscriptionOps.inscribeAllReplacements = function (_a) {
        var baseDisplayName = _a.baseDisplayName, inscriptionRecords = _a.inscriptionRecords, replacementRecords = _a.replacementRecords;
        return inscriptionRecords.reduce(function (title, inscriptionRecord) {
            return InscriptionOps.inscribeSingleReplacement({
                baseDisplayName: title,
                inscriptionTemplate: inscriptionRecord,
                replacementRecord: (replacementRecords || [])
                    .find(function (replacementRecord) { return replacementRecord.metadata.identifier === inscriptionRecord.metadata.identifier; })
            });
        }, baseDisplayName);
    };
    InscriptionOps.inscribeSingleReplacement = function (_a) {
        var baseDisplayName = _a.baseDisplayName, inscriptionTemplate = _a.inscriptionTemplate, replacementRecord = _a.replacementRecord;
        var workingInscription;
        var invalidReplacementRecord = !replacementRecord || !replacementRecord.column || replacementRecord.value === null;
        if (invalidReplacementRecord && inscriptionTemplate.inscribeDisplayNameOptional) {
            workingInscription = inscriptionTemplate.inscribeDisplayNameOptional;
        }
        else if (replacementRecord && inscriptionTemplate.inscribeDisplayName) {
            workingInscription = inscriptionTemplate.inscribeDisplayName;
        }
        else {
            return baseDisplayName;
        }
        var placeholderRecord = {
            column: InscriptionOps.Placeholders.Column,
            operator: InscriptionOps.Placeholders.Operator,
        };
        workingInscription = Object.keys(placeholderRecord).reduce(function (inscription, placeholderKey) {
            var constant = inscriptionTemplate[placeholderKey].constant;
            if (constant) {
                return InscriptionOps.inscribeText(inscription, placeholderRecord[placeholderKey], constant.displayName || '');
            }
            if (replacementRecord) {
                var choices = inscriptionTemplate[placeholderKey].choices;
                var chosen = choices.find(function (choice) { return choice[placeholderKey] === replacementRecord[placeholderKey]; });
                if (chosen) {
                    return InscriptionOps.inscribeText(inscription, placeholderRecord[placeholderKey], chosen.displayName || '');
                }
            }
            return InscriptionOps.inscribeText(inscription, placeholderRecord[placeholderKey], '');
        }, workingInscription);
        var replacementValue = (replacementRecord && (replacementRecord.value !== null && replacementRecord.value !== undefined))
            ? replacementRecord.value
            : '';
        workingInscription = InscriptionOps.inscribeText(workingInscription, InscriptionOps.Placeholders.Value, replacementValue);
        workingInscription = InscriptionOps.inscribeText(workingInscription, InscriptionOps.Placeholders.DisplayName, baseDisplayName);
        return workingInscription;
    };
    InscriptionOps.Placeholders = {
        // Generic InscriptionTarget types
        Column: /{column}/g,
        Operator: /{operator}/g,
        // Special string properties
        Value: /{value}/g,
        DisplayName: /{displayName}/g,
    };
    return InscriptionOps;
}());
exports.InscriptionOps = InscriptionOps;
//# sourceMappingURL=inscription.js.map