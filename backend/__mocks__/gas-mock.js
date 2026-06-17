// backend/__mocks__/gas-mock.js

// A simple in-memory mock for Google Apps Script's SpreadsheetApp
const mockSheet = {
  data: [],
  getRange: jest.fn(function(row, col, numRows, numCols) {
    return {
      getValues: jest.fn(() => this.data),
      setValues: jest.fn((values) => {
        this.data = values;
      }),
      getValue: jest.fn(() => (this.data[0] ? this.data[0][0] : '')),
      setValue: jest.fn((value) => {
        if (!this.data[0]) this.data[0] = [];
        this.data[0][0] = value;
      })
    };
  }),
  getLastRow: jest.fn(function() {
    return this.data.length;
  }),
  getLastColumn: jest.fn(function() {
    return this.data[0] ? this.data[0].length : 0;
  }),
  clear: jest.fn()
};

const mockSpreadsheetApp = {
  getActiveSpreadsheet: jest.fn(() => ({
    getSheetByName: jest.fn((name) => mockSheet)
  }))
};

// Expose these globally so the test environment can access them just like GAS
global.SpreadsheetApp = mockSpreadsheetApp;

// You can add PropertiesService, Session, CacheService here as needed
global.PropertiesService = {
  getScriptProperties: jest.fn(() => ({
    getProperty: jest.fn(),
    setProperty: jest.fn(),
    deleteProperty: jest.fn()
  }))
};
