const puppeteer = require('puppeteer');
const excel = require('xlsx');
const glob = require( 'glob' ) ;

let myArgs = process.argv.slice(2).map(Number)
,   start = myArgs[0] || 0
,   end = myArgs[1] || 10
,   product_URL = null 
,   dataObj = null 
;

async function crawlProduct(url, num) {

    let strTitle 
    ,   strStock
    ,   strPrice = null 
    ;

    console.log({ num, url }) ;

    /* 아마존 사이트가 아닐 경우 */
    if( url.indexOf( 'amazon.com' ) < 0 ){
        console.log( '아마존 사이트가 아닙니다' ) ;
        return ;
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    /* 제목 */
    const [el] = await page.$x('//*[@id="productTitle"]');      // Product Title 
    const title = await el.getProperty('textContent');
    const jsonTitle = await title.jsonValue();
    strTitle= jsonTitle.trim();
    console.log({strTitle});

    /* 재고 */
    const [el2] = await page.$x('//*[@id="availability"]/span');        // Stock availability
    const stock = await el2.getProperty('textContent');
    const jsonStock = await stock.jsonValue();
    strStock= jsonStock.trim();
    console.log({strStock});   
    
    /* 가격 */
    const [el3] = await page.$x('//*[@id="price_inside_buybox"]');      // Price 

    /* el3을 찾아서 존재한다면 품절이 아니다. */
    if( el3 ) {
        const price = await el3.getProperty('textContent');
        const jsonPrice = await price.jsonValue();
        strPrice = jsonPrice.trim().replace("US$","");    
    } else {    /* 품절 일 경우 0 처리 */
        strPrice = 0 ;
    }

    console.log({strPrice});   
    // console.log({ num, url, strTitle, strStock, strPrice }) ;
    browser.close();
    return { num, url, strTitle, strStock, strPrice } ;
}


function findFiles( url, num ){
    return new Promise((resolve, reject) => {
        let result = crawlProduct( url, num ) ;
        if( result ) {
            resolve( result ) ;
        }
    })
}




function excelRead(fileName, i) {
    
    let workbook = excel.readFile(fileName)
    ,   worksheet = workbook.Sheets['미국']
    ,   address_hyperlink_col = 'G'
    ,   address_hyperlink_low = 4+i
    ,   combined_address = address_hyperlink_col+String(address_hyperlink_low)
    ,   desired_URL = worksheet[combined_address]
    ,   strURL
    ;   

    // console.log({ desired_URL }) ;

    /* 링크 데이터 값의 형태가 다른 경우 오류가 나기 때문에 null 값으로 넘긴다. */
    strURL = !desired_URL.f ? null : strURL = desired_URL.f.replace("\"","").replace("HYPERLINK(","").replace("\",\"A\")", ""); 
    
    /* if( !desired_URL.f ) {
        strURL = null ;
    } else {
        strURL = desired_URL.f.replace("\"","").replace("HYPERLINK(","").replace("\",\"A\")", ""); 
    } */

    return strURL;
}

function generateAlphabetLow(i) {
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
}

// generateAlphabetLow(27);

/* for(i=0;i<len;i++) {
    product_URL = excelRead('상품등록표.xlsx', i);
    crawlProduct(product_URL);
    console.log({ product_URL }) ;
} */

(async () => {
    for(i=start;i<end;i++) {
        // console.log( '\n', i, ' 번째 시작!' ) ;
        product_URL = excelRead('상품등록표_2.xlsx', i);
        if( product_URL == null ) {            
            console.log( `${i}번째 상품의 링크값에 오류가 있습니다.` ) ;
        } else {
            dataObj = await findFiles( product_URL, i ) ;
        }
    }
})();