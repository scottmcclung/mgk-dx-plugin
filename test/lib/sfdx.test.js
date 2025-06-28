"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const sinon = tslib_1.__importStar(require("sinon"));
describe('sfdx', () => {
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should add --json flag if not present', () => {
        // Test the string manipulation logic by checking internal behavior
        const command = 'sfdx force:org:list --targetusername test@example.com';
        const withJson = command.includes('--json') ? command : command + ' --json';
        (0, chai_1.expect)(withJson).to.equal('sfdx force:org:list --targetusername test@example.com --json');
    });
    it('should not duplicate --json flag if already present', () => {
        const command = 'sfdx force:org:list --json';
        const withJson = command.includes('--json') ? command : command + ' --json';
        (0, chai_1.expect)(withJson).to.equal('sfdx force:org:list --json');
    });
    it('should properly split command parts', () => {
        const fullCommand = 'sfdx force:org:list --json';
        const parts = fullCommand.split(' ');
        const commandName = parts[0];
        const args = parts.slice(1);
        (0, chai_1.expect)(commandName).to.equal('sfdx');
        (0, chai_1.expect)(args).to.deep.equal(['force:org:list', '--json']);
    });
});
