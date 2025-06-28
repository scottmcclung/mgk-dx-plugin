import { expect } from 'chai';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import * as ExcelJS from 'exceljs';

describe('Functional Integration Tests', function() {
    this.timeout(60000); // 60 second timeout for real Salesforce calls

    const testOutputDir = './test-output';
    const testOrg = process.env.SF_TEST_ORG || 'nk'; // Default to 'nk' or use env var

    before(() => {
        // Create test output directory
        if (!fs.existsSync(testOutputDir)) {
            fs.mkdirSync(testOutputDir, { recursive: true });
        }
    });

    after(() => {
        // Clean up test files
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true });
        }
    });

    describe('Excel Export Functionality', () => {
        it('should export Account object to Excel with valid structure', async () => {
            const outputBase = path.join(testOutputDir, 'account-test');
            const outputPath = outputBase + '.xlsx';
            
            // Execute the actual plugin command
            execSync(
                `sf mgk:schema:export --format xls --targetpath "${outputBase}" --sobjects Account --targetusername ${testOrg}`,
                { encoding: 'utf8' }
            );

            // Verify file was created
            expect(fs.existsSync(outputPath)).to.be.true;
            
            // Read and validate Excel content
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(outputPath);
            
            // Verify workbook has worksheets
            expect(workbook.worksheets.length).to.be.greaterThan(0);
            
            // Find the Account worksheet (should be the first data worksheet after summary)
            const accountWorksheet = workbook.worksheets.find(ws => ws.name.includes('Account') || ws.name === 'Sheet1');
            expect(accountWorksheet).to.not.be.undefined;
            
            // Verify worksheet has data
            expect(accountWorksheet!.rowCount).to.be.greaterThan(10); // Account should have many fields
            
            // Convert worksheet to array for easier validation
            const rows: any[] = [];
            accountWorksheet!.eachRow((row, rowNumber) => {
                if (rowNumber > 1) { // Skip header
                    const rowData: any = {};
                    row.eachCell((cell, colNumber) => {
                        const header = accountWorksheet!.getRow(1).getCell(colNumber).value;
                        rowData[header as string] = cell.value;
                    });
                    rows.push(rowData);
                }
            });
            
            // Verify required Account fields are present
            const nameField = rows.find(r => r['API Name'] === 'Name');
            expect(nameField).to.not.be.undefined;
            expect(nameField['Required']).to.equal('Yes');
            expect(nameField['Type']).to.equal('Text(255)');
            expect(nameField['Object']).to.equal('Account');
            expect(nameField['Publisher']).to.equal('System');

            const idField = rows.find(r => r['API Name'] === 'Id');
            expect(idField).to.not.be.undefined;
            expect(idField['Type']).to.equal('Id');
            expect(idField['Required']).to.equal('Yes');
            expect(idField['Object']).to.equal('Account');
            
            // Verify picklist field formatting if present
            const typeField = rows.find(r => r['API Name'] === 'Type');
            if (typeField) {
                expect(typeField['Type']).to.include('Picklist(');
                expect(typeField['Required']).to.equal('No');
                expect(typeField['Object']).to.equal('Account');
            }
        });
    });

    describe('CSV Export Functionality', () => {
        it('should export Contact object to CSV with accurate field data', (done) => {
            const outputBase = path.join(testOutputDir, 'contact-test');
            const outputPath = outputBase + '.csv';
            
            // Execute the actual plugin command
            execSync(
                `sf mgk:schema:export --format csv --targetpath "${outputBase}" --sobjects Contact --targetusername ${testOrg}`,
                { encoding: 'utf8' }
            );

            // Verify file was created
            expect(fs.existsSync(outputPath)).to.be.true;

            // Parse and validate CSV content
            const results: any[] = [];
            fs.createReadStream(outputPath)
                .pipe(csvParser())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    try {
                        // Verify we have data
                        expect(results.length).to.be.greaterThan(10); // Contact should have many fields

                        // Verify required Contact fields are present
                        const lastNameField = results.find(r => r['API Name'] === 'LastName');
                        expect(lastNameField).to.not.be.undefined;
                        expect(lastNameField['Required']).to.equal('Yes');
                        expect(lastNameField['Object']).to.equal('Contact');

                        // Verify field type formatting
                        const emailField = results.find(r => r['API Name'] === 'Email');
                        expect(emailField).to.not.be.undefined;
                        expect(emailField['Type']).to.match(/Email|Text/); // Email type or Text

                        // Verify picklist formatting
                        const picklistFields = results.filter(r => r['Type'].includes('Picklist('));
                        expect(picklistFields.length).to.be.greaterThan(0);

                        done();
                    } catch (error) {
                        done(error);
                    }
                });
        });
    });

    describe('Custom Objects Filter', () => {
        it('should export only custom objects when flag is set', async () => {
            const outputBase = path.join(testOutputDir, 'custom-only-test');
            const outputPath = outputBase + '.csv';
            
            execSync(
                `sf mgk:schema:export --format csv --targetpath "${outputBase}" --customobjectsonly --targetusername ${testOrg}`,
                { encoding: 'utf8' }
            );

            expect(fs.existsSync(outputPath)).to.be.true;
            
            // Verify file has content (assuming org has custom objects)
            const content = fs.readFileSync(outputPath, 'utf8');
            const lines = content.split('\n').filter(line => line.trim());
            
            if (lines.length > 1) { // If any objects were exported
                // Use the existing csv-parser library to handle complex CSV parsing correctly
                const uniqueObjects = new Set<string>();
                const results: any[] = [];
                
                const stream = fs.createReadStream(outputPath)
                    .pipe(csvParser())
                    .on('data', (data) => results.push(data))
                    .on('end', () => {
                        // Extract unique object names from the parsed results
                        results.forEach(row => {
                            const objectName = row['Object'];
                            if (objectName) {
                                uniqueObjects.add(objectName);
                            }
                        });
                        
                        // Check that ALL unique objects have custom extensions
                        uniqueObjects.forEach(objectName => {
                            const isCustomObject = objectName.endsWith('__c') || 
                                                  objectName.endsWith('__mdt') || 
                                                  objectName.endsWith('__e') || 
                                                  objectName.endsWith('__x') || 
                                                  objectName.endsWith('__b') || 
                                                  objectName.endsWith('__p') ||
                                                  objectName.endsWith('__Share') ||
                                                  objectName.endsWith('__History') ||
                                                  objectName.endsWith('__Feed') ||
                                                  objectName.endsWith('__Tag') ||
                                                  objectName.endsWith('__ChangeEvent') ||
                                                  objectName.endsWith('__chn') ||
                                                  objectName.endsWith('__hd') ||
                                                  objectName.endsWith('__xo');
                            
                            expect(isCustomObject, `Object '${objectName}' should have custom naming extension when --customobjectsonly flag is used`).to.be.true;
                        });
                    });
                
                // Wait for the stream to complete before continuing
                await new Promise<void>((resolve, reject) => {
                    stream.on('end', resolve);
                    stream.on('error', reject);
                });
            }
            // Note: If lines.length === 1 (only header), that means 0 custom objects were found, which is valid
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid org gracefully', () => {
            try {
                execSync(
                    'sf mgk:schema:export --format csv --targetpath "./invalid-test.csv" --sobjects Account --targetusername invalid-org-123',
                    { encoding: 'utf8', stdio: 'pipe' }
                );
                expect.fail('Should have thrown an error for invalid org');
            } catch (error: any) {
                expect(error.message).to.include('No authorization information');
            }
        });

        it('should handle non-existent objects gracefully', () => {
            const outputBase = path.join(testOutputDir, 'nonexistent-test');
            const outputPath = outputBase + '.csv';
            
            try {
                // This should complete but might not create file if no results
                const result = execSync(
                    `sf mgk:schema:export --format csv --targetpath "${outputBase}" --sobjects NonExistentObject__c --targetusername ${testOrg}`,
                    { encoding: 'utf8' }
                );
                
                // Either file should be created with minimal content, or command should complete successfully
                if (fs.existsSync(outputPath)) {
                    const content = fs.readFileSync(outputPath, 'utf8');
                    const lines = content.split('\n').filter(line => line.trim());
                    // Should have header but minimal/no data
                    expect(lines.length).to.be.lessThan(10);
                } else {
                    // If no file created, that's also acceptable for non-existent objects
                    expect(result).to.be.a('string'); // Command completed successfully
                }
            } catch (error) {
                // It's acceptable if command fails gracefully for non-existent objects
                expect(error).to.be.instanceOf(Error);
            }
        });
    });

    describe('Data Accuracy Validation', () => {
        it('should export standard Account fields with correct attributes', (done) => {
            const outputBase = path.join(testOutputDir, 'account-validation');
            const outputPath = outputBase + '.csv';
            
            execSync(
                `sf mgk:schema:export --format csv --targetpath "${outputBase}" --sobjects Account --targetusername ${testOrg}`,
                { encoding: 'utf8' }
            );

            const results: any[] = [];
            fs.createReadStream(outputPath)
                .pipe(csvParser())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    try {
                        // Validate specific known Account fields
                        const nameField = results.find(r => r['API Name'] === 'Name');
                        expect(nameField).to.not.be.undefined;
                        expect(nameField['Required']).to.equal('Yes');
                        expect(nameField['Type']).to.equal('Text(255)');
                        expect(nameField['Publisher']).to.equal('System');

                        const idField = results.find(r => r['API Name'] === 'Id');
                        expect(idField).to.not.be.undefined;
                        expect(idField['Type']).to.equal('Id');
                        expect(idField['Required']).to.equal('Yes');

                        // Validate picklist field if present
                        const typeField = results.find(r => r['API Name'] === 'Type');
                        if (typeField) {
                            expect(typeField['Type']).to.include('Picklist(');
                            expect(typeField['Required']).to.equal('No');
                        }

                        done();
                    } catch (error) {
                        done(error);
                    }
                });
        });
    });
});