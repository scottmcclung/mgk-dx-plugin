mgk-dx-plugin
=======
Description:

The Schema


Example api usage:
- Return schema for all objects
  - sfdx mgk:schema:export --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com 
  - sfdx mgk:schema:export -f csv
  - sfdx mgk:schema:export -f md
  - sfdx mgk:schema:export -f sql   <- can be used to create similar tables in db or to import into draw.io for diagramming
- Return schema for single named object
  - sfdx mgk:schema:export --sobject Account --format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com
  - sfdx mgk:schema:export -s Account -f csv
  - sfdx mgk:schema:export -s Account -f md
  - sfdx mgk:schema:export -s Account -f sql
- Return schema for multiple named objects
  - sfdx mgk:schema:export -sobject Account,Case,Opportuntiy -format xls --targetpath ./dir/example-filename.xls --targetusername myOrg@example.com
  - sfdx mgk:schema:export -s Account,Case,Opportuntiy -f csv
  - sfdx mgk:schema:export -s Account,Case,Opportuntiy -f md
  - sfdx mgk:schema:export -s Account,Case,Opportuntiy -f sql



Open questions:
- when exporting to xls, it makes sense to include each object on a separate tab.  How should multiple objects be represented in csv?
  - by including an object name column and just listing all the fields in order of object?
  - by generating a unique file for each object?
  - is this a user choice?
  - does this mean that we add the format as a command segment to avoid the args explosion?  (this violates the style guide)
    - mgk:schema:export:csv
    - mgk:schema:export:xls
    - mgk:schema:export:sql
    - mgk:schema:export:md
- should we include a global report that provides a summary of objects?  maybe details from describe global endpoint.
  - org encoding
  
