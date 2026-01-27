export class CsvInvoiceFilter {
  private invoiceHeaderFields = {
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
  private invoiceHeaderAsArray = Array.from(Object.values(this.invoiceHeaderFields));
  private csvFile: string;
  private header: string = '';
  private invoices: string[] = [];

  constructor(csvFile: string) {
    this.csvFile = csvFile;
  }

  filterInvoices() {
    const linesSeparator = '\n';
    const lines = this.csvFile.split(linesSeparator);
    const headerLine = 0;
    this.header = lines[headerLine];
    const startLineForInvoices = 1;
    this.invoices = lines.slice(startLineForInvoices);

    this.checkDataIsValid();

    return [this.header]
      .concat(
        this.filterRepeatedInvoiceNumber()
          .filterInvoicesWithoutJustOneTaxCode()
          .filterInvoicesWithoutJustOneIdentifier()
          .filterInvoicesWithIvaWronglyCalculated()
          .filterInvoicesWithIgicWronglyCalculated()
          .getFilteredInvoices()
      )
      .join('\n');
  }

  private checkDataIsValid() {
    this.checkHeaderIsValid();
    this.invoices.forEach((invoice) => {
      const invoiceAsArray = invoice.split(',');
      const bruto = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.bruto)];
      this.checkAmountIsValid(bruto);
      const neto = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.neto)];
      this.checkAmountIsValid(neto);
      const iva = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.iva)];
      this.checkAmountIsValid(iva);
      const igic = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.igic)];
      this.checkAmountIsValid(igic);
    });
  }

  private checkHeaderIsValid() {
    if (this.header !== this.invoiceHeaderAsArray.join(',')) throw new TypeError('Invalid Header');
  }

  private checkAmountIsValid(gross: string) {
    if (!/^[0-9]*$/.test(gross)) throw new TypeError('Invalid Amount');
  }

  private getIndexOfField(field: string) {
    return this.invoiceHeaderAsArray.indexOf(field);
  }

  private filterRepeatedInvoiceNumber() {
    const invoiceNumbersFrequency = this.getMapOfInvoiceNumbers();

    this.invoices = this.invoices.filter((invoice) => {
      const invoiceNumber = invoice.split(',')[this.getIndexOfField(this.invoiceHeaderFields.numFactura)];
      const frequency = invoiceNumbersFrequency.get(invoiceNumber);
      return frequency && frequency === 1;
    });

    return this;
  }

  private getMapOfInvoiceNumbers() {
    const invoiceNumbers = this.invoices.map(
      (invoice) => invoice.split(',')[this.getIndexOfField(this.invoiceHeaderFields.numFactura)]
    );

    const invoiceNumbersFrequency = new Map<string, number>();
    for (const invoiceNumber of invoiceNumbers) {
      const frequency = invoiceNumbersFrequency.get(invoiceNumber);
      if (frequency) invoiceNumbersFrequency.set(invoiceNumber, frequency + 1);
      else invoiceNumbersFrequency.set(invoiceNumber, 1);
    }

    return invoiceNumbersFrequency;
  }

  private filterInvoicesWithoutJustOneTaxCode() {
    this.invoices = this.invoices.filter((invoice) => {
      const invoiceAsArray = invoice.split(',');
      const iva = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.iva)];
      const igic = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.igic)];
      const hasBothTaxCodes = iva !== '' && igic !== '';
      const hasNoTaxCode = iva === '' && igic === '';
      return !hasBothTaxCodes && !hasNoTaxCode;
    });

    return this;
  }

  private filterInvoicesWithoutJustOneIdentifier() {
    this.invoices = this.invoices.filter((invoice) => {
      const invoiceAsArray = invoice.split(',');
      const cifCliente = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.cifCliente)];
      const nifCliente = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.nifCliente)];
      const hasBothIdentifiers = cifCliente !== '' && nifCliente !== '';
      const hasNoIdentifier = cifCliente === '' && nifCliente === '';
      return !hasBothIdentifiers && !hasNoIdentifier;
    });

    return this;
  }

  private filterInvoicesWithIvaWronglyCalculated() {
    this.invoices = this.invoices.filter((invoice) => {
      const invoiceAsArray = invoice.split(',');
      const bruto = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.bruto)];
      const neto = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.neto)];
      const iva = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.iva)];
      if (iva === '') return true;
      return Number(bruto) === (Number(neto) * Number(iva)) / 100 + Number(neto);
    });

    return this;
  }

  private filterInvoicesWithIgicWronglyCalculated() {
    this.invoices = this.invoices.filter((invoice) => {
      const invoiceAsArray = invoice.split(',');
      const bruto = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.bruto)];
      const neto = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.neto)];
      const igic = invoiceAsArray[this.getIndexOfField(this.invoiceHeaderFields.igic)];
      if (igic === '') return true;
      return Number(bruto) === (Number(neto) * Number(igic)) / 100 + Number(neto);
    });

    return this;
  }

  private getFilteredInvoices() {
    return this.invoices;
  }
}
