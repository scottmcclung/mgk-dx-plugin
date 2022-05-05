const translatedFieldTypes = {
    id: 'Id',
    string: 'Text',
    textarea: 'Text Area',
    url: 'Url',
    address: 'Address',
    int: 'Number',
    double: 'Number',
    currency: 'Currency',
    boolean: 'Checkbox',
    percent: 'Percent',
    picklist: 'Picklist',
    multipicklist: 'Multi-Picklist',
    combobox: 'Combobox',
    reference: 'Lookup',
    email: 'Email',
    date: 'Date',
    datetime: 'Datetime',
    time: 'Time',
    phone: 'Phone',
    location: 'Location'
};


const headerMap = [
    {
        fieldDataKey: "object",
        columnTitle: "Object",
        width: 25,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "apiName",
        columnTitle: "API Name",
        width: 25,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "label",
        columnTitle: "Label",
        width: 25,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "dataType",
        columnTitle: "Type",
        width: 50,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "description",
        columnTitle: "Description",
        width: 50,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "helpText",
        columnTitle: "Help Text",
        width: 50,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "required",
        columnTitle: "Required",
        width: 10,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "unique",
        columnTitle: "Unique",
        width: 10,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "externalId",
        columnTitle: "External Id",
        width: 12,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "caseSensitive",
        columnTitle: "Case Sensitive",
        width: 15,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "formula",
        columnTitle: "Formula",
        width: 50,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "defaultValue",
        columnTitle: "Default Value",
        width: 12,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "encrypted",
        columnTitle: "Encrypted",
        width: 10,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "dataOwner",
        columnTitle: "Data Owner",
        width: 18,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "fieldUsage",
        columnTitle: "Field Usage",
        width: 10,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "dataSensitivityLevel",
        columnTitle: "Data Sensitivity Level",
        width: 10,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "complianceCategorization",
        columnTitle: "Compliance Categorization",
        width: 10,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "publisherId",
        columnTitle: "Publisher",
        width: 10,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
];

const summaryHeaderMap = [
    {
        fieldDataKey: "ObjectType",
        columnTitle:  "Type",
        width:        15,
        style:        {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "QualifiedApiName",
        columnTitle: "Qualified Api Name",
        width: 25,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "Label",
        columnTitle: "Label",
        width: 25,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "PluralLabel",
        columnTitle: "Plural Label",
        width: 25,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "KeyPrefix",
        columnTitle: "Key Prefix",
        width: 10,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "InternalSharingModel",
        columnTitle: "Internal Sharing Model",
        width: 20,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "ExternalSharingModel",
        columnTitle: "External Sharing Model",
        width: 20,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "HelpSettingPageName",
        columnTitle: "Help Setting Page Name",
        width: 20,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "HelpSettingPageUrl",
        columnTitle: "Help Setting Page Url",
        width: 25,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "LastModifiedByName",
        columnTitle:  "Last Modified By",
        width:        25,
        style:        {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "LastModifiedDate",
        columnTitle:  "Last Modified Date",
        width:        30,
        style:        {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "CreatedByName",
        columnTitle: "Created By",
        width: 25,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "CreatedDate",
        columnTitle: "Created Date",
        width: 30,
        style: {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    },
    {
        fieldDataKey: "Publisher",
        columnTitle:  "Publisher",
        width:        15,
        style:        {
            alignment: {vertical: 'top', horizontal: 'left', wrapText: true}
        }
    }
];

export {headerMap, summaryHeaderMap, translatedFieldTypes};
