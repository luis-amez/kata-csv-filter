import { CsvInvoiceFilter } from '../core/csvFilter';

describe('csvFilter', () => {
  it('fails if the file does not have the right header', () => {
    expect(() => {
      new CsvInvoiceFilter('hello, world').filterInvoices();
    }).toThrow('Invalid Header');
  });

  it('fails if there is an invoice with not valid gross', () => {
    expect(() => {
      const wrongGrossInvoice = createInvoiceLine({ bruto: 'hello' });
      new CsvInvoiceFilter(createInvoiceHeader() + wrongGrossInvoice).filterInvoices();
    }).toThrow('Invalid Amount');
  });

  it('fails if there is an invoice with not valid net', () => {
    expect(() => {
      const wrongNetInvoice = createInvoiceLine({ neto: 'hello' });
      new CsvInvoiceFilter(createInvoiceHeader() + wrongNetInvoice).filterInvoices();
    }).toThrow('Invalid Amount');
  });

  it('fails if there is an invoice with not valid IVA', () => {
    expect(() => {
      const wrongIVAInvoice = createInvoiceLine({ iva: 'hello' });
      new CsvInvoiceFilter(createInvoiceHeader() + wrongIVAInvoice).filterInvoices();
    }).toThrow('Invalid Amount');
  });

  it('fails if there is an invoice with not valid IGIC', () => {
    expect(() => {
      const wrongIGICInvoice = createInvoiceLine({ igic: '-5' });
      new CsvInvoiceFilter(createInvoiceHeader() + wrongIGICInvoice).filterInvoices();
    }).toThrow('Invalid Amount');
  });

  it('filters nothing if the file only has the right header', () => {
    const csvInvoiceFilter = new CsvInvoiceFilter(createInvoiceHeader());

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(createInvoiceHeader());
  });

  it('filters nothing if the file has the right information', () => {
    const invoices =
      createInvoiceHeader() +
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
    const distinctNumberInvoice = createInvoiceHeader() + createInvoiceLine({});
    const repeatedNumberInvoices = createInvoiceLine({ numFactura: 2 }) + createInvoiceLine({ numFactura: 2 });
    const allInvoices = distinctNumberInvoice + repeatedNumberInvoices;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(distinctNumberInvoice);
  });

  it('filters out all the invoices with both IVA and IGIC', () => {
    const oneTaxCodeInvoice = createInvoiceHeader() + createInvoiceLine({});
    const bothKindOfTaxesInvoice = createInvoiceLine({ numFactura: 2, iva: '20', igic: '10' });
    const allInvoices = oneTaxCodeInvoice + bothKindOfTaxesInvoice;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(oneTaxCodeInvoice);
  });

  it('filters out all the invoices without tax code', () => {
    const oneTaxCodeInvoice = createInvoiceHeader() + createInvoiceLine({});
    const noTaxCodeInvoice = createInvoiceLine({ numFactura: 2, iva: '', igic: '' });
    const allInvoices = oneTaxCodeInvoice + noTaxCodeInvoice;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(oneTaxCodeInvoice);
  });

  it('filters out all the invoices with both CIF and NIF', () => {
    const oneIdentifierInvoice = createInvoiceHeader() + createInvoiceLine({});
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
    const oneIdentifierInvoice = createInvoiceHeader() + createInvoiceLine({});
    const noIdentifierInvoice = createInvoiceLine({ numFactura: 2, cifCliente: '', nifCliente: '' });
    const allInvoices = oneIdentifierInvoice + noIdentifierInvoice;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(oneIdentifierInvoice);
  });

  it('filters out all the invoices with IVA wrongly calculated', () => {
    const rightIvaInvoice = createInvoiceHeader() + createInvoiceLine({});
    const wrongIvaInvoice = createInvoiceLine({ numFactura: 2, bruto: '1100', neto: '1000', iva: '20' });
    const allInvoices = rightIvaInvoice + wrongIvaInvoice;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(rightIvaInvoice);
  });

  it('filters out all the invoices with IGIC wrongly calculated', () => {
    const rightIgicInvoice = createInvoiceHeader() + createInvoiceLine({});
    const wrongIgicInvoice = createInvoiceLine({ numFactura: 2, bruto: '1100', neto: '1000', iva: '', igic: '8' });
    const allInvoices = rightIgicInvoice + wrongIgicInvoice;
    const csvInvoiceFilter = new CsvInvoiceFilter(allInvoices);

    const result = csvInvoiceFilter.filterInvoices();

    expect(result).toBe(rightIgicInvoice);
  });

  it('only keeps the header if all the invoices are invalid', () => {
    const wrongInvoices = createInvoiceHeader() + createInvoiceLine({}) + createInvoiceLine({});

    const result = new CsvInvoiceFilter(wrongInvoices).filterInvoices();

    expect(result).toBe(createInvoiceHeader());
  });
});

function createInvoiceHeader() {
  return 'Num_factura,Fecha,Bruto,Neto,IVA,IGIC,Concepto,CIF_cliente,NIF_cliente';
}

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
