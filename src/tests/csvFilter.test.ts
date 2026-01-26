import { CsvInvoiceFilter } from '../core/csvFilter';

describe('csvFilter', () => {
  it('fails if the file does not have the right header', () => {
    expect(() => {
      new CsvInvoiceFilter('hello, world').filterInvoices();
    }).toThrow('Invalid Header');
  });

  it('filters nothing if the file only has the right header', () => {
    const csvInvoiceFilter = new CsvInvoiceFilter(CsvInvoiceFilter.getInvoiceHeader());

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(CsvInvoiceFilter.getInvoiceHeader());
  });

  it('filters nothing if the file has the right information', () => {
    const invoices =
      CsvInvoiceFilter.getInvoiceHeader() +
      '\n1,02/05/2019,960,800,20,,ACERLaptop,B76430134,' +
      '\n2,03/08/2019,2160,2000,,8,MacBook Pro,,78544372A';
    const csvInvoiceFilter = new CsvInvoiceFilter(invoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(invoices);
  });

  it('filters out all the invoices with repeated invoice number', () => {
    const distinctNumberInvoices =
      CsvInvoiceFilter.getInvoiceHeader() + '\n1,02/05/2019,960,800,20,,ACERLaptop,B76430134,';
    const repeatedNumberInvoices =
      '\n2,03/08/2019,2160,2000,,8,MacBook Pro,,78544372A' + '\n2,10/11/2019,2200,2000,,10,MacBook Pro,,78544372A';
    const allInvoices = distinctNumberInvoices + repeatedNumberInvoices;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(distinctNumberInvoices);
  });
});
