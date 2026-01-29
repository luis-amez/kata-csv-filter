export interface InvoiceList {
  header: string;
  invoices: string[];
}

export class CsvInvoiceParser {
  private constructor(private readonly csvFile: string) {
    this.csvFile = csvFile;
  }

  static create(csvFile: string) {
    return new CsvInvoiceParser(csvFile);
  }

  parse() {
    const linesSeparator = '\n';
    const lines = this.csvFile.split(linesSeparator);
    const headerLine = 0;
    const header = lines[headerLine];
    const startLineForInvoices = 1;
    const invoices = lines.slice(startLineForInvoices);

    return <InvoiceList>{
      header,
      invoices,
    };
  }
}

export class InvoiceFilter {
  private static readonly invoiceHeaderFields = {
    numFactura: 'Num_factura',
    fecha: 'Fecha',
    bruto: 'Bruto',
    neto: 'Neto',
    iva: 'IVA',
    igic: 'IGIC',
    concepto: 'Concepto',
    cifCliente: 'CIF_cliente',
    nifCliente: 'NIF_cliente',
  };
  private static readonly invoiceHeaderAsArray = Array.from(Object.values(this.invoiceHeaderFields));

  private readonly header: string;
  private readonly invoices: string[];

  private constructor(readonly invoiceList: InvoiceList) {
    this.header = invoiceList.header;
    this.invoices = invoiceList.invoices;
  }

  static create(invoiceList: InvoiceList) {
    InvoiceFilter.checkDataIsValid(invoiceList.header, invoiceList.invoices);
    return new InvoiceFilter(invoiceList);
  }

  private static checkDataIsValid(header: string, invoices: string[]) {
    this.checkHeaderIsValid(header);
    invoices.forEach((invoice) => {
      const invoiceAsArray = invoice.split(',');
      const bruto = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.bruto)];
      this.checkAmountIsValid(bruto);
      const neto = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.neto)];
      this.checkAmountIsValid(neto);
      const iva = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.iva)];
      this.checkAmountIsValid(iva);
      const igic = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.igic)];
      this.checkAmountIsValid(igic);
    });
  }

  private static checkHeaderIsValid(header: string) {
    if (header !== this.invoiceHeaderAsArray.join(',')) throw new TypeError('Invalid Header');
  }

  private static checkAmountIsValid(amount: string) {
    if (!/^[0-9]*$/.test(amount)) throw new TypeError('Invalid Amount');
  }

  private static getIndexOfField(field: string) {
    return InvoiceFilter.invoiceHeaderAsArray.indexOf(field);
  }

  filterInvoices() {
    const invoiceNumbersFrequency = this.getInvoiceNumbersFrequency();
    const filteredInvoices = this.invoices.filter(
      (invoice) =>
        this.isInvoiceNumberUnique(invoice, invoiceNumbersFrequency) &&
        this.hasJustOneTaxCode(invoice) &&
        this.hasJustOneIdentifier(invoice) &&
        this.isIvaCorrect(invoice) &&
        this.isIgicCorrect(invoice)
    );

    return <InvoiceList>{
      header: this.header,
      invoices: filteredInvoices,
    };
  }

  private isInvoiceNumberUnique(invoice: string, invoiceNumbersFrequency: Map<string, number>) {
    const invoiceNumber =
      invoice.split(',')[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.numFactura)];
    const frequency = invoiceNumbersFrequency.get(invoiceNumber);
    return frequency && frequency === 1;
  }

  private getInvoiceNumbersFrequency() {
    const invoiceNumbers = this.invoices.map(
      (invoice) => invoice.split(',')[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.numFactura)]
    );

    const invoiceNumbersFrequency = new Map<string, number>();
    for (const invoiceNumber of invoiceNumbers) {
      const frequency = invoiceNumbersFrequency.get(invoiceNumber);
      if (frequency) invoiceNumbersFrequency.set(invoiceNumber, frequency + 1);
      else invoiceNumbersFrequency.set(invoiceNumber, 1);
    }

    return invoiceNumbersFrequency;
  }

  private hasJustOneTaxCode(invoice: string) {
    const invoiceAsArray = invoice.split(',');
    const iva = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.iva)];
    const igic = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.igic)];
    const hasBothTaxCodes = iva !== '' && igic !== '';
    const hasNoTaxCode = iva === '' && igic === '';
    return !(hasBothTaxCodes || hasNoTaxCode);
  }

  private hasJustOneIdentifier(invoice: string) {
    const invoiceAsArray = invoice.split(',');
    const cifCliente = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.cifCliente)];
    const nifCliente = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.nifCliente)];
    const hasBothIdentifiers = cifCliente !== '' && nifCliente !== '';
    const hasNoIdentifier = cifCliente === '' && nifCliente === '';
    return !(hasBothIdentifiers || hasNoIdentifier);
  }

  private isIvaCorrect(invoice: string) {
    const invoiceAsArray = invoice.split(',');
    const bruto = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.bruto)];
    const neto = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.neto)];
    const iva = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.iva)];
    if (iva === '') return true;
    return parseFloat(bruto) === this.getBrutoFromNeto(neto, iva);
  }

  private isIgicCorrect(invoice: string) {
    const invoiceAsArray = invoice.split(',');
    const bruto = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.bruto)];
    const neto = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.neto)];
    const igic = invoiceAsArray[InvoiceFilter.getIndexOfField(InvoiceFilter.invoiceHeaderFields.igic)];
    if (igic === '') return true;
    return parseFloat(bruto) === this.getBrutoFromNeto(neto, igic);
  }

  private getBrutoFromNeto(neto: string, tax: string) {
    return parseFloat(neto) + (parseFloat(neto) * parseFloat(tax)) / 100;
  }
}
