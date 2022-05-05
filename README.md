# mgk-dx-plugin
Plugin for the Salesforce CLI

## Features

### Schema Export
Extracts org metadata to provide a list of objects and fields in a convenient Excel report. (Field attributes include the **Description** field!)

The default behavior is to extract all standard and custom objects.  This will also include the schema for things like External Objects, Platform Events, or Custom Metadata Types.

- Use the `--customobjectsonly` flag to limit the output to just custom objects.
- Use the `-s` flag to limit the output to a specific list of objects.  `-s Account,Contact,MyCustomObject__c,MyPlatformEvent__e`


## Installation into the Salesforce CLI

Install the plugin into your Salesforce CLI using this command:

```sh-session
$ sfdx plugins:install mgk-dx-plugin
```

You can check a successful installation with `sfdx plugins`. Updates are applied when executing `sfdx plugins:update`.

## Salesforce CLI References
More information about the Salesforce CLI can be found at [https://developer.salesforce.com/tools/sfdxcli](https://developer.salesforce.com/tools/sfdxcli)
<br>
An admin focused Salesforce CLI tutorial [https://www.youtube.com/watch?v=VMU8xbmqmQ4](https://www.youtube.com/watch?v=VMU8xbmqmQ4) 


## Commands
  <!-- commands -->
* [`sfdx mgk:schema:export -f xls|csv -p <filepath> [-s <array>] [--customobjectsonly] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mgkschemaexport--f-xlscsv--p-filepath--s-array---customobjectsonly--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx mgk:schema:export -f xls|csv -p <filepath> [-s <array>] [--customobjectsonly] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Exports sobject schema to various formats

```
Exports sobject schema to various formats

USAGE
  $ sfdx mgk:schema:export -f xls|csv -p <filepath> [-s <array>] [--customobjectsonly] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --format=(xls|csv)                                                            (required) the format of the export
                                                                                    (xls, csv)

  -p, --targetpath=targetpath                                                       (required) the destination filepath

  -s, --sobjects=sobjects                                                           the named sobjects to be included in
                                                                                    the export - default is all custom
                                                                                    and standard objects are exported

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --customobjectsonly                                                               limit the report to custom objects

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx mgk:schema:export --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com 
  $ sfdx mgk:schema:export --format xls --targetpath ./dir/example-filename.xls --customobjectsonly --targetusername 
  myOrg@example.com 
  $ sfdx mgk:schema:export --sobject Account --format xls --targetpath ./dir/example-filename.xls --targetusername 
  myOrg@example.com
  $ sfdx mgk:schema:export --sobject Account,Case,Opportunity,MyCustomObject__c --format xls --targetpath 
  ./dir/example-filename.xls --targetusername myOrg@example.com
```
<!-- commandsstop -->
