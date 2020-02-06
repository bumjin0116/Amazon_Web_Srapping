const puppeteer = require('puppeteer');
const excel = require('xlsx');

async function crawlProduct(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    var [return_val];

    const [el] = await page.$x('//*[@id="productTitle"]');      // Product Title 
    const title = await el.getProperty('textContent');
    const jsonTitle = await title.jsonValue();
    const strTitle= jsonTitle.trim();

    const [el2] = await page.$x('//*[@id="availability"]/span');        // Stock availability
    const stock = await el2.getProperty('textContent');
    const jsonStock = await stock.jsonValue();
    const strStock= jsonStock.trim();

    const [el3] = await page.$x('//*[@id="price_inside_buybox"]');      // Price 
    const price = await el3.getProperty('textContent');
    const jsonPrice = await price.jsonValue();
    const strPrice = jsonPrice.trim().replace("US$","");

    console.log({strTitle,strStock,strPrice});

    browser.close();
}

function excelRead(fileName, i) {
    var workbook = excel.readFile(fileName);
    var worksheet = workbook.Sheets['미국'];
    var address_hyperlink_col = 'G';
    var address_hyperlink_low = 4+i;
    var combined_address = address_hyperlink_col+String(address_hyperlink_low);

    var desired_URL = worksheet[combined_address];
    var strURL = desired_URL.f.replace("\"","").replace("HYPERLINK(","").replace("\",\"A\")", "");

    console.log({strURL});
    //crawlProduct(strURL);

    return strURL;
}

/*function generateAlphabetLow(i) {
    if (i>26) {
        firstAlpha = i/27;
        secondAlpha = i-firstAlpha*26;
        combindedAlpha = String.fromCharCode(64+firstAlpha) + String.fromCharCode(64+secondAlpha);
        
        console.log({combindedAlpha});
    }
    else {
        combindedAlpha = String.fromCharCode(64+i);

        console.log({combindedAlpha});
    }
    //return combindedAlpha;
}*/

generateAlphabetLow(27);

for(i=0;i<100;i++) {
    var product_URL = excelRead('상품등록표.xlsx', i);
    crawlProduct(product_URL);
}