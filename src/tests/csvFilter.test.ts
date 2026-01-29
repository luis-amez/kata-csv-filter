import { InvoiceFilter, InvoiceList } from '../core/csvFilter';

describe('InvoiceFilter', () => {
  it('fails if the file does not have the right header', () => {
    expect(() => {
      InvoiceFilter.create({ header: 'hello, world', invoices: [] }).filterInvoices();
    }).toThrow('Invalid Header');
  });

  it('fails if there is an invoice with not valid "bruto"', () => {
    expect(() => {
      const wrongBrutoInvoice = createInvoiceLine({ bruto: 'hello' });
      InvoiceFilter.create(createInvoiceList([wrongBrutoInvoice])).filterInvoices();
    }).toThrow('Invalid Amount');
  });

  it('fails if there is an invoice with not valid "neto"', () => {
    expect(() => {
      const wrongNetoInvoice = createInvoiceLine({ neto: 'hello' });
      InvoiceFilter.create(createInvoiceList([wrongNetoInvoice])).filterInvoices();
    }).toThrow('Invalid Amount');
  });

  it('fails if there is an invoice with not valid IVA', () => {
    expect(() => {
      const wrongIVAInvoice = createInvoiceLine({ iva: 'hello' });
      InvoiceFilter.create(createInvoiceList([wrongIVAInvoice])).filterInvoices();
    }).toThrow('Invalid Amount');
  });

  it('fails if there is an invoice with not valid IGIC', () => {
    expect(() => {
      const wrongIGICInvoice = createInvoiceLine({ igic: '-5' });
      InvoiceFilter.create(createInvoiceList([wrongIGICInvoice])).filterInvoices();
    }).toThrow('Invalid Amount');
  });

  it('filters nothing if the file only has the right header', () => {
    const invoiceList = createInvoiceList([]);
    const invoiceFilter = InvoiceFilter.create(invoiceList);

    const result = invoiceFilter.filterInvoices();

    expect(result).toEqual(invoiceList);
  });

  it('filters nothing if the file has the right information', () => {
    const invoices = [
      createInvoiceLine({}),
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
      }),
    ];
    const invoiceList = createInvoiceList(invoices);
    const invoiceFilter = InvoiceFilter.create(invoiceList);

    const result = invoiceFilter.filterInvoices();

    expect(result).toEqual(invoiceList);
  });

  it('filters out all the invoices with repeated invoice number', () => {
    const distinctNumberInvoice = [createInvoiceLine({})];
    const repeatedNumberInvoices = [createInvoiceLine({ numFactura: 2 }), createInvoiceLine({ numFactura: 2 })];
    const allInvoices = distinctNumberInvoice.concat(repeatedNumberInvoices);
    const invoiceFilter = InvoiceFilter.create(createInvoiceList(allInvoices));

    const result = invoiceFilter.filterInvoices();

    expect(result).toEqual(createInvoiceList(distinctNumberInvoice));
  });

  it('filters out all the invoices with both IVA and IGIC', () => {
    const oneTaxCodeInvoice = createInvoiceLine({});
    const bothKindOfTaxesInvoice = createInvoiceLine({ numFactura: 2, iva: '20', igic: '10' });
    const allInvoices = [oneTaxCodeInvoice, bothKindOfTaxesInvoice];
    const invoiceFilter = InvoiceFilter.create(createInvoiceList(allInvoices));

    const result = invoiceFilter.filterInvoices();

    expect(result).toEqual(createInvoiceList([oneTaxCodeInvoice]));
  });

  it('filters out all the invoices without tax code', () => {
    const oneTaxCodeInvoice = createInvoiceLine({});
    const noTaxCodeInvoice = createInvoiceLine({ numFactura: 2, iva: '', igic: '' });
    const allInvoices = [oneTaxCodeInvoice, noTaxCodeInvoice];
    const invoiceFilter = InvoiceFilter.create(createInvoiceList(allInvoices));

    const result = invoiceFilter.filterInvoices();

    expect(result).toEqual(createInvoiceList([oneTaxCodeInvoice]));
  });

  it('filters out all the invoices with both CIF and NIF', () => {
    const oneIdentifierInvoice = createInvoiceLine({});
    const bothIdentifiersInvoice = createInvoiceLine({
      numFactura: 2,
      cifCliente: 'B76430134',
      nifCliente: '78544372A',
    });
    const allInvoices = [oneIdentifierInvoice, bothIdentifiersInvoice];
    const invoiceFilter = InvoiceFilter.create(createInvoiceList(allInvoices));

    const result = invoiceFilter.filterInvoices();

    expect(result).toEqual(createInvoiceList([oneIdentifierInvoice]));
  });

  it('filters out all the invoices without identifier', () => {
    const oneIdentifierInvoice = createInvoiceLine({});
    const noIdentifierInvoice = createInvoiceLine({ numFactura: 2, cifCliente: '', nifCliente: '' });
    const allInvoices = [oneIdentifierInvoice, noIdentifierInvoice];
    const invoiceFilter = InvoiceFilter.create(createInvoiceList(allInvoices));

    const result = invoiceFilter.filterInvoices();

    expect(result).toEqual(createInvoiceList([oneIdentifierInvoice]));
  });

  it('filters out all the invoices with IVA wrongly calculated', () => {
    const rightIvaInvoice = createInvoiceLine({});
    const wrongIvaInvoice = createInvoiceLine({ numFactura: 2, bruto: '1100', neto: '1000', iva: '20' });
    const allInvoices = [rightIvaInvoice, wrongIvaInvoice];
    const invoiceFilter = InvoiceFilter.create(createInvoiceList(allInvoices));

    const result = invoiceFilter.filterInvoices();

    expect(result).toEqual(createInvoiceList([rightIvaInvoice]));
  });

  it('filters out all the invoices with IGIC wrongly calculated', () => {
    const rightIgicInvoice = createInvoiceLine({});
    const wrongIgicInvoice = createInvoiceLine({ numFactura: 2, bruto: '1100', neto: '1000', iva: '', igic: '8' });
    const allInvoices = [rightIgicInvoice, wrongIgicInvoice];
    const invoiceFilter = InvoiceFilter.create(createInvoiceList(allInvoices));

    const result = invoiceFilter.filterInvoices();

    expect(result).toEqual(createInvoiceList([rightIgicInvoice]));
  });

  it('only keeps the header if all the invoices are invalid', () => {
    const wrongInvoices = [createInvoiceLine({}), createInvoiceLine({})];
    const invoiceFilter = InvoiceFilter.create(createInvoiceList(wrongInvoices));

    const result = invoiceFilter.filterInvoices();

    expect(result).toEqual(createInvoiceList([]));
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

function createInvoiceList(invoices: string[]): InvoiceList {
  return { header: createInvoiceHeader(), invoices };
}
