//import jsPDF from 'jspdf';
//import jsPDF from '../../node_modules/jspdf/dist/jspdf.debug';
import jsPDF from 'jspdf-yworks';
//import jsPDF from '../jspdf.debug';
import 'jspdf-customfonts';
import './default_vfs';
import placeSvg from './placeSvg';
import setFont from './setFont';
import addressSender from './pdf/addressSender';
import addressCustomer from './pdf/addressCustomer';
import heading from './pdf/heading';
import table from './pdf/table';
import totals from './pdf/totals';
import text from './pdf/text';
import footer from './pdf/footer';

export default (printData) => {

    const doc = new jsPDF('p', 'pt');

    setFont(doc);

    // <><>><><>><>><><><><><>>><><<><><><><>
    // SETTINGS
    // <><>><><>><>><><><><><>>><><<><><><><>

    const fontSizes = {
        TitleFontSize:14,
        SubTitleFontSize:12,
        NormalFontSize:10,
        SmallFontSize:9
    };
    const lineSpacing = 12;

    let startX = 57;
    let startY = 130; // bit more then 45mm

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const pageCenterX = pageWidth / 2;

    // <><>><><>><>><><><><><>>><><<><><><><>
    // COMPONENTS
    // <><>><><>><>><><><><><>>><><<><><><><>

    // <><>><><>><>><><><><><>>><><<><><><><>
    // Background init
    let backgroundLoaded = placeSvg(doc, '/img/webandmedia-grey.svg', -70, 250, 5.6);
    Promise.all([backgroundLoaded]).then(() => {
        // <><>><><>><>><><><><><>>><><<><><><><>
        // Sender's address

        startY = addressSender(doc, printData.addressSender, startY, fontSizes.NormalFontSize, lineSpacing);

        const svgLoaded = placeSvg(doc, '/img/stripes_ecks_bottom.svg', 225, 136, 0.45);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Customer address

        startY += 10;
        startY = addressCustomer(doc, printData.address, startY, fontSizes.NormalFontSize, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // INVOICE DATA
        // <><>><><>><>><><><><><>>><><<><><><><>

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Invoicenumber, -date and subject

        startY = heading(doc, printData.invoice, startY, fontSizes, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Table with items

        startY = table(doc, printData.items, startY, fontSizes.NormalFontSize, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Totals

        startY = totals(doc, printData.invoice, startY, fontSizes.NormalFontSize, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Text

        startY = text(doc, printData.invoice.text, startY, fontSizes.NormalFontSize, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Footer

        footer(doc, printData, fontSizes.SmallFontSize, lineSpacing);

        // <><>><><>><>><><><><><>>><><<><><><><>
        // REPEATED PAGE COMPONENTS
        // <><>><><>><>><><><><><>>><><<><><><><>

        const pageNr = doc.internal.getNumberOfPages();

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Fold Marks

        const foldX = 12;
        const foldMarksY = [288, 411, 585];
        let n = 0;

        while (n < pageNr) {
            n++;

            doc.setPage(n);

            doc.setDrawColor(206, 218, 192);
            doc.setLineWidth(0.5);

            foldMarksY.map(valueY => {
                doc.line(foldX, valueY, foldX + 23, valueY);
            });
        }

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Logo

        let logoLoaded = placeSvg(doc, '/img/favicon-A-2.svg', pageCenterX - 25, 25, 0.025);

        n = 1;

        console.log('loaded', n, pageNr);
        while (n < pageNr) {
            n++;
            console.log('placeSvg logo');
            doc.setPage(n);

            logoLoaded = placeSvg(doc, '/img/favicon-A-2.svg', pageCenterX - 25, 25, 0.025, n);
            doc.link(pageCenterX - 25, 25, 50, 50, {url: printData.personalInfo.website});

           // logoLoaded = placeSvg(doc, '/img/webandmedia-grey.svg', -22, 300, 5, n);
        }

        // <><>><><>><>><><><><><>>><><<><><><><>
        // Page Numbers

        if (pageNr > 1) {
            n = 0;
            doc.setFontSize(fontSizes.SmallFontSize);

            while (n < pageNr) {
                n++;

                doc.setPage(n);

                doc.text(n + ' / ' + pageNr, pageCenterX, pageHeight - 20, 'center');
            }
        }

        // <><>><><>><>><><><><><>>><><<><><><><>
        // PRINT
        // <><>><><>><>><><><><><>>><><<><><><><>

        Promise.all([svgLoaded, logoLoaded]).then(() => {
            doc.save("invoice.pdf");
        });
    });
}
