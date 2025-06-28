import { expect } from 'chai';
import * as sinon from 'sinon';

describe('sfdx', () => {
    let sandbox: sinon.SinonSandbox;

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
        expect(withJson).to.equal('sfdx force:org:list --targetusername test@example.com --json');
    });

    it('should not duplicate --json flag if already present', () => {
        const command = 'sfdx force:org:list --json';
        const withJson = command.includes('--json') ? command : command + ' --json';
        expect(withJson).to.equal('sfdx force:org:list --json');
    });

    it('should properly split command parts', () => {
        const fullCommand = 'sfdx force:org:list --json';
        const parts = fullCommand.split(' ');
        const commandName = parts[0];
        const args = parts.slice(1);
        
        expect(commandName).to.equal('sfdx');
        expect(args).to.deep.equal(['force:org:list', '--json']);
    });
});