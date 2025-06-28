#!/bin/bash

# Functional Testing Script for mgk-dx-plugin
# Tests the actual plugin functionality without requiring local linking

set -e

# Configuration
TEST_ORG="${SF_TEST_ORG:-nk}"
OUTPUT_DIR="./functional-test-output"
PLUGIN_NAME="mgk-dx-plugin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Setup
setup() {
    log "Setting up functional test environment..."
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Build the plugin
    log "Building plugin..."
    npm run prepack
    
    # Check if plugin is installed/linked
    if sf plugins | grep -q "$PLUGIN_NAME"; then
        log "Plugin found: $(sf plugins | grep $PLUGIN_NAME)"
    else
        error "Plugin not found. Please install or link the plugin first:"
        echo "  sf plugins:install mgk-dx-plugin"
        echo "  OR"
        echo "  sf plugins:link ."
        exit 1
    fi
    
    # Verify test org exists
    if ! sf org display --target-org "$TEST_ORG" >/dev/null 2>&1; then
        error "Test org '$TEST_ORG' not found or not authenticated"
        echo "Please authenticate to your test org first:"
        echo "  sf org login web --alias $TEST_ORG"
        exit 1
    fi
    
    log "Using test org: $TEST_ORG"
}

# Test functions
test_excel_export() {
    log "Testing Excel export functionality..."
    
    local output_base="$OUTPUT_DIR/test-excel-account"
    local output_file="$output_base.xlsx"
    
    sf mgk:schema:export \
        --format xls \
        --targetpath "$output_base" \
        --sobjects Account \
        --targetusername "$TEST_ORG"
    
    if [[ -f "$output_file" ]]; then
        local file_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
        if [[ $file_size -gt 5000 ]]; then
            success "Excel export test passed (${file_size} bytes)"
        else
            error "Excel file too small (${file_size} bytes)"
            return 1
        fi
    else
        error "Excel file not created"
        return 1
    fi
}

test_csv_export() {
    log "Testing CSV export functionality..."
    
    local output_base="$OUTPUT_DIR/test-csv-contact"
    local output_file="$output_base.csv"
    
    sf mgk:schema:export \
        --format csv \
        --targetpath "$output_base" \
        --sobjects Contact \
        --targetusername "$TEST_ORG"
    
    if [[ -f "$output_file" ]]; then
        local line_count=$(wc -l < "$output_file")
        if [[ $line_count -gt 10 ]]; then
            success "CSV export test passed ($line_count lines)"
            
            # Validate CSV structure
            if head -1 "$output_file" | grep -q "Object,API Name,Label,Type"; then
                success "CSV headers validated"
            else
                warn "CSV headers may be incorrect"
            fi
        else
            error "CSV file has too few lines ($line_count)"
            return 1
        fi
    else
        error "CSV file not created"
        return 1
    fi
}

test_custom_objects_filter() {
    log "Testing custom objects only filter..."
    
    local output_base="$OUTPUT_DIR/test-custom-only"
    local output_file="$output_base.csv"
    
    sf mgk:schema:export \
        --format csv \
        --targetpath "$output_base" \
        --customobjectsonly \
        --targetusername "$TEST_ORG"
    
    if [[ -f "$output_file" ]]; then
        local line_count=$(wc -l < "$output_file")
        success "Custom objects filter test completed ($line_count lines)"
        
        # Validate that ALL exported objects have custom naming extensions
        if [[ $line_count -gt 1 ]]; then
            # Use Node.js for proper CSV parsing to handle quoted fields correctly
            local validation_result=$(node -e "
const fs = require('fs');
const csv = require('csv-parser');

const customExtensions = ['__c', '__mdt', '__e', '__x', '__b', '__p', '__Share', '__History', '__Feed', '__Tag', '__ChangeEvent', '__chn', '__hd', '__xo'];
const uniqueObjects = new Set();
const invalidObjects = [];

fs.createReadStream('$output_file')
  .pipe(csv())
  .on('data', (row) => {
    const objectName = row['Object'];
    if (objectName) {
      uniqueObjects.add(objectName);
      
      // Check if object has custom naming extension
      const isCustom = customExtensions.some(ext => objectName.endsWith(ext));
      if (!isCustom) {
        invalidObjects.push(objectName);
      }
    }
  })
  .on('end', () => {
    const totalObjects = uniqueObjects.size;
    const invalidCount = invalidObjects.length;
    
    console.log(\`\${totalObjects},\${invalidCount}\`);
    if (invalidObjects.length > 0) {
      invalidObjects.slice(0, 5).forEach(obj => {
        console.error(\`INVALID:\${obj}\`);
      });
    }
  })
  .on('error', (err) => {
    console.log('0,999');
  });
")
            
            local counts=(${validation_result//,/ })
            local total_objects=${counts[0]}
            local invalid_objects=${counts[1]}
            
            if [[ $invalid_objects -eq 999 ]]; then
                error "Failed to parse CSV file for validation"
                return 1
            elif [[ $invalid_objects -eq 0 ]]; then
                success "All $total_objects exported objects have custom naming extensions"
            else
                error "$invalid_objects non-custom objects found when --customobjectsonly was specified"
                return 1
            fi
        else
            success "No custom objects found (valid result - org may have no custom objects)"
        fi
    else
        error "Custom objects file not created"
        return 1
    fi
}

test_error_handling() {
    log "Testing error handling..."
    
    # Test with invalid org
    if sf mgk:schema:export \
        --format csv \
        --targetpath "$OUTPUT_DIR/error-test.csv" \
        --sobjects Account \
        --targetusername "invalid-org-12345" 2>/dev/null; then
        error "Should have failed with invalid org"
        return 1
    else
        success "Error handling test passed (invalid org rejected)"
    fi
}

validate_data_accuracy() {
    log "Validating data accuracy..."
    
    local output_base="$OUTPUT_DIR/validation-account"
    local output_file="$output_base.csv"
    
    sf mgk:schema:export \
        --format csv \
        --targetpath "$output_base" \
        --sobjects Account \
        --targetusername "$TEST_ORG"
    
    # Check for required Account.Name field
    if grep -q "Account,Name,Account Name,Text(255)" "$output_file"; then
        success "Account Name field validated"
    else
        error "Account Name field validation failed"
        return 1
    fi
    
    # Check for Account.Id field
    if grep -q "Account,Id,Account ID,Id" "$output_file"; then
        success "Account Id field validated"
    else
        error "Account Id field validation failed"
        return 1
    fi
    
    # Check for picklist formatting
    if grep -q "Picklist(" "$output_file"; then
        success "Picklist formatting validated"
    else
        warn "No picklist fields found (may be expected)"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up test files..."
    rm -rf "$OUTPUT_DIR"
    success "Cleanup completed"
}

# Main execution
main() {
    log "Starting mgk-dx-plugin functional tests..."
    
    setup
    
    local failed_tests=0
    
    # Run all tests
    test_excel_export || ((failed_tests++))
    test_csv_export || ((failed_tests++))
    test_custom_objects_filter || ((failed_tests++))
    test_error_handling || ((failed_tests++))
    validate_data_accuracy || ((failed_tests++))
    
    # Report results
    echo ""
    if [[ $failed_tests -eq 0 ]]; then
        success "All functional tests passed! ✅"
        cleanup
        exit 0
    else
        error "$failed_tests test(s) failed ❌"
        warn "Test output files preserved in: $OUTPUT_DIR"
        exit 1
    fi
}

# Handle script interruption
trap cleanup EXIT

# Run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi