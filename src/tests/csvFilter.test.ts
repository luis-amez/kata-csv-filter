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
      createInvoiceLine({}) +
      createInvoiceLine({
        numFactura: 2,
        fecha: '03/08/2019',
        bruto: '2160',
        neto: '2000',
        iva: '',
        igic: '8',
        concepto: 'MacBook Pro',
        cifCliente: '',
        nifCliente: '78544372A',
      });
    const csvInvoiceFilter = new CsvInvoiceFilter(invoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(invoices);
  });

  it('filters out all the invoices with repeated invoice number', () => {
    const distinctNumberInvoice = CsvInvoiceFilter.getInvoiceHeader() + createInvoiceLine({});
    const repeatedNumberInvoices = createInvoiceLine({ numFactura: 2 }) + createInvoiceLine({ numFactura: 2 });
    const allInvoices = distinctNumberInvoice + repeatedNumberInvoices;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(distinctNumberInvoice);
  });

  it('filters out all the invoices with both IVA and IGIC', () => {
    const oneTaxCodeInvoice = CsvInvoiceFilter.getInvoiceHeader() + createInvoiceLine({});
    const bothKindOfTaxesInvoice = createInvoiceLine({ numFactura: 2, iva: '20', igic: '10' });
    const allInvoices = oneTaxCodeInvoice + bothKindOfTaxesInvoice;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(oneTaxCodeInvoice);
  });

  it('filters out all the invoices without tax code', () => {
    const oneTaxCodeInvoice = CsvInvoiceFilter.getInvoiceHeader() + createInvoiceLine({});
    const noTaxCodeInvoice = createInvoiceLine({ numFactura: 2, iva: '', igic: '' });
    const allInvoices = oneTaxCodeInvoice + noTaxCodeInvoice;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(oneTaxCodeInvoice);
  });

  it('filters out all the invoices with both CIF and NIF', () => {
    const oneIdentifierInvoice = CsvInvoiceFilter.getInvoiceHeader() + createInvoiceLine({});
    const bothIdentifiersInvoice = createInvoiceLine({
      numFactura: 2,
      cifCliente: 'B76430134',
      nifCliente: '78544372A',
    });
    const allInvoices = oneIdentifierInvoice + bothIdentifiersInvoice;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(oneIdentifierInvoice);
  });

  it('filters out all the invoices without identifier', () => {
    const oneIdentifierInvoice = CsvInvoiceFilter.getInvoiceHeader() + createInvoiceLine({});
    const noIdentifierInvoice = createInvoiceLine({ numFactura: 2, cifCliente: '', nifCliente: '' });
    const allInvoices = oneIdentifierInvoice + noIdentifierInvoice;

    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(oneIdentifierInvoice);
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
