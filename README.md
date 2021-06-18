# mgk-dx-plugin
Plugin for the Salesforce CLI

# Usage
  <!-- usage -->
```sh-session
$ npm install -g schema
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
schema/0.0.0 darwin-x64 node-v12.16.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->

# Commands
  <!-- commands -->
* [`sfdx mgk:schema:export -f xls|csv -p <filepath> [-s <array>] [--customobjectsonly] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-mgkschemaexport--f-xlscsv--p-filepath--s-array---customobjectsonly--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx mgk:schema:export -f xls|csv -p <filepath> [-s <array>] [--customobjectsonly] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

export sobject schema to various formats

```
export sobject schema to various formats

USAGE
  $ sfdx mgk:schema:export -f xls|csv -p <filepath> [-s <array>] [--customobjectsonly] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --format=(xls|csv)                                                            (required) the format of the export
                                                                                    (xls, csv, sql, or md)

  -p, --targetpath=targetpath                                                       (required) the destination filepath

  -s, --sobjects=sobjects                                                           the named sobjects to be included in
                                                                                    the export  - if ommitted, all
                                                                                    custom and standard objects will be
                                                                                    exported

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
  $ sfdx mgk:schema:export --sobject Account --format xls --targetpath ./dir/example-filename.xls --targetusername 
  myOrg@example.com
  $ sfdx mgk:schema:export -sobject Account,Case,Opportuntiy -format xls --targetpath ./dir/example-filename.xls 
  --targetusername myOrg@example.com
```
<!-- commandsstop -->
