export class CsvInvoiceFilter {
  private static invoiceHeaderFields = {
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
  private static invoiceHeaderAsArray = [
    this.invoiceHeaderFields.numFactura,
    this.invoiceHeaderFields.fecha,
    this.invoiceHeaderFields.bruto,
    this.invoiceHeaderFields.neto,
    this.invoiceHeaderFields.iva,
    this.invoiceHeaderFields.igic,
    this.invoiceHeaderFields.concepto,
    this.invoiceHeaderFields.cifCliente,
    this.invoiceHeaderFields.nifCliente,
  ];

  private csvFile: string;
  private invoices: string[] = [];

  constructor(csvFile: string) {
    this.csvFile = csvFile;
  }

  filterInvoices() {
    const linesSeparator = '\n';
    const lines = this.csvFile.split(linesSeparator);
    const headerLine = 0;
    const header = lines[headerLine];
    const startLineForInvoices = 1;
    this.invoices = lines.slice(startLineForInvoices);

    if (header !== CsvInvoiceFilter.getInvoiceHeader()) throw new TypeError('Invalid Header');

    return [header].concat(this.filterRepeatedInvoiceNumber().getFilteredInvoices()).join('\n');
  }

  private filterRepeatedInvoiceNumber() {
    const invoiceNumbersFrequency = this.getMapOfInvoiceNumbers();

    this.invoices = this.invoices.filter((invoice) => {
      const invoiceNumber =
        invoice.split(',')[
          CsvInvoiceFilter.invoiceHeaderAsArray.indexOf(CsvInvoiceFilter.invoiceHeaderFields.numFactura)
        ];
      const frequency = invoiceNumbersFrequency.get(invoiceNumber);
      return frequency && frequency === 1;
    });

    return this;
  }

  private getMapOfInvoiceNumbers() {
    const invoiceNumbers = this.invoices.map(
      (invoice) =>
        invoice.split(',')[
          CsvInvoiceFilter.invoiceHeaderAsArray.indexOf(CsvInvoiceFilter.invoiceHeaderFields.numFactura)
        ]
    );

    const invoiceNumbersFrequency = new Map<string, number>();
    for (const invoiceNumber of invoiceNumbers) {
      const frequency = invoiceNumbersFrequency.get(invoiceNumber);
      if (frequency) invoiceNumbersFrequency.set(invoiceNumber, frequency + 1);
      else invoiceNumbersFrequency.set(invoiceNumber, 1);
    }

    return invoiceNumbersFrequency;
  }

  private getFilteredInvoices() {
    return this.invoices;
  }

  static getInvoiceHeader() {
    return this.invoiceHeaderAsArray.join(',');
  }
}
