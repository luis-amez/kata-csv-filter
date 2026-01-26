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
    const invoices = CsvInvoiceFilter.getInvoiceHeader() + createInvoiceLine({}) + createInvoiceLine({ numFactura: 2 });
    const csvInvoiceFilter = new CsvInvoiceFilter(invoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(invoices);
  });

  it('filters out all the invoices with repeated invoice number', () => {
    const distinctNumberInvoices = CsvInvoiceFilter.getInvoiceHeader() + createInvoiceLine({});
    const repeatedNumberInvoices = createInvoiceLine({ numFactura: 2 }) + createInvoiceLine({ numFactura: 2 });
    const allInvoices = distinctNumberInvoices + repeatedNumberInvoices;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(distinctNumberInvoices);
  });

  it('filters out all the invoices with both IVA and IGIC', () => {
    const distinctTaxesInvoices = CsvInvoiceFilter.getInvoiceHeader() + createInvoiceLine({});
    const bothKindOfTaxesInvoices = createInvoiceLine({ numFactura: 2, iva: '20', igic: '10' });
    const allInvoices = distinctTaxesInvoices + bothKindOfTaxesInvoices;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(distinctTaxesInvoices);
  });
});

function createInvoiceLine({
  numFactura = 1,
  fecha = '02/05/2019',
  bruto = '1200',
  neto = '1000',
  iva = '20',
  igic = '',
  concepto = 'ACERLaptop',
  cifCliente = 'B76430134',
  nifCliente = '',
}) {
  return `\n${numFactura},${fecha},${bruto},${neto},${iva},${igic},${concepto},${cifCliente},${nifCliente}`;
}
