const puppeteer = require('puppeteer');
const excel = require('xlsx');
const glob = require( 'glob' ) ;
const cheerio = require('cheerio') ;

let myArgs = process.argv.slice(2).map(Number)
,   start = myArgs[0] || 0
,   end = myArgs[1] || 5
,   product_URL = null 
,   dataObj = null 
,   result = null
,   objPrice = new Object()
,   objStock = new Object()
,   fileName = '상품등록표.xlsx'
,   workbook = excel.readFile(fileName)
,   worksheet = workbook.Sheets['미국']
;

async function crawlProduct(url, num) {

    let strTitle 
    ,   strStock
    ,   strPrice = null 
    ,   html = ''
    ;

    // console.log({ num, url }) ;

    /* 아마존 사이트가 아닐 경우 */
    if( url.indexOf( 'amazon.com' ) < 0 ){
        console.log( '아마존 사이트가 아닙니다' ) ;
        return ;
    }

    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const response = await page.goto(url, {
        waitLoad: true, 
        waitUntil: 'networkidle2',
        // timeout: 20000
      });
    
    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    // await timeout(10000)

    html = await response.text() ;

    const $ = cheerio.load( html ) ;
    
    console.log( '1 타이틀 : ', $('#productTitle').text().trim() ) ;
    console.log( '2 가격 : ', $('#priceblock_ourprice').text().trim() ) ;
    console.log( '3 재고 : ', $('#availability_feature_div').text().trim() ) ;
    console.log( '4 브랜드 : ', $('#bylineInfo').text() ) ;
    console.log( '\n' ) ;

    // console.log( '5 :', '5 ininini' ) ;

    // console.log( html ) ;


    
    // /* 제목 */
    // const [el] = await page.$x('//*[@id="productTitle"]');      
    // const title = await el.getProperty('textContent');
    // const jsonTitle = await title.jsonValue();
    // strTitle= jsonTitle.trim();
    // console.log({strTitle});

    // /* 재고 */
    // const [el2] = await page.$x('//*[@id="availability"]/span');        
    // const stock = await el2.getProperty('textContent');
    // const jsonStock = await stock.jsonValue();
    // strStock= jsonStock.trim();
    // console.log({strStock});   
    
    // /* 가격 */
    // const [el3] = await page.$x('//*[@id="price_inside_buybox"]');      

    // /* el3을 찾아서 존재한다면 품절이 아니다. */
    // if( el3 ) {
    //     const price = await el3.getProperty('textContent');
    //     const jsonPrice = await price.jsonValue();
    //     strPrice = jsonPrice.trim().replace("US$","");    
    // } else {    /* 품절 일 경우 0 처리 */
    //     strPrice = 0 ;
    // }

    // console.log({strPrice});   
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
    
    let address_hyperlink_col = 'G'
    ,   address_hyperlink_low = 4+i
    ,   combined_address = address_hyperlink_col+String(address_hyperlink_low)
    ,   desired_URL = worksheet[combined_address]
    ,   strURL
    ;   

    try {
        if(desired_URL.f != null) {
            strURL = desired_URL.f.replace("\"","").replace("HYPERLINK(","").replace("\",\"A\")", ""); 
        } 
        else if (desired_URL.l.Target != null) {
            strURL = desired_URL.l.Target;
        }
    } catch (e) {
        console.log('다음과 같은 에러가 발생했습니다.: [%s] : [%s]', e.name, e.message);
        console.log("********************************** desired_URL is **********************************");
        console.log({desired_URL});
        return null;
    }

    return strURL;
}

function excelWrite (fileName, number, stock, price) {
    let address_Stock_col = 'I'
    ,   address_Price_col = 'J'
    ,   address_hyperlink_low = 4+number
    ,   combined_address_Stock = address_Stock_col + String(address_hyperlink_low)
    ,   combined_address_Price = address_Price_col + String(address_hyperlink_low)
    ,   temp1 = null
    ,   temp2 = null
    ;
    
    workbook.Sheets['미국'][combined_address_Price] = price;
    workbook.Sheets['미국'][combined_address_Stock] = stock;
    temp1 = workbook.Sheets['미국'][combined_address_Price];
    temp2 = workbook.Sheets['미국'][combined_address_Stock];

}

function constructCell (sInput) {
    var objTemp = new Object();
    objTemp.t = 's';
    objTemp.v = sInput;
    objTemp.r = '<t>' + sInput +'</t>';
    objTemp.h = sInput;
    objTemp.w = sInput;

    return objTemp;
}

(async () => {
    for(i=start;i<end;i++) {
        product_URL = excelRead('상품등록표.xlsx', i);
        if( product_URL == null ) {            
            console.log( `${i}번째 상품의 링크값에 오류가 있습니다.` ) ;
        } else {
            dataObj = await findFiles( product_URL, i ) ;
            
            objStock = constructCell(dataObj.strStock);
            objPrice = constructCell(dataObj.strPrice);
            
            excelWrite ('상품등록표.xlsx', dataObj.num, objStock, objPrice, i);
        }
    }
    excel.writeFile(workbook, "상품등록표_Result.xlsx");
})();