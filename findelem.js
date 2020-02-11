const puppeteer = require( 'puppeteer' ) ;

let url = ['https://www.amazon.com/Casio-MDV106-1AV-Analog-Watch-Black/dp/B009KYJAJY/ref=sr_1_1?keywords=MDV106-1A&qid=1554602376&s=gateway&sr=8-1', 'https://www.amazon.com/Nike-L91-Cap-Tech-Hat/dp/B0731ZKSCL/ref=sr_1_8?keywords=nike%2Bgolf%2Bhat&qid=1554299549&s=gateway&sr=8-8&th=1&psc=1' ];

(async()=>{
  const browser = await puppeteer.launch() ;
  const page = await browser.newPage() ;

  
  await page.goto( url[1], {waitUntil: 'networkidle0'} ) ;

  // await page.waitForNavigation({
  //   waitUntil: 'networkidle0',
  // });
  // await page.waitFor( 5000 ) ;
  // await page.waitForSelector('#availability span');


  const bodyHandle = await page.$('body');
  // const stock = await page.evaluate( bodyHandle => bodyHandle.querySelector('#availabilityInsideBuyBox_feature_div span') , bodyHandle ) ;
  // const stock = await page.evaluate( bodyHandle => bodyHandle.querySelector('#a-box-group').getAttribute('class') , bodyHandle ) ;
  // const stock = await page.evaluate( bodyHandle => bodyHandle.querySelector('#addToCart').innerHTML , bodyHandle ) ;
  const title = await page.evaluate( bodyHandle => bodyHandle.querySelector('#productTitle').innerHTML , bodyHandle ) ;
  const price = await page.evaluate( bodyHandle => bodyHandle.querySelector('#price_inside_buybox') , bodyHandle ) ;
  const stock = await page.evaluate( bodyHandle => bodyHandle.querySelector('#availability span').innerHTML , bodyHandle ) ;
  // console.log({ title }) ;
  // console.log({ stock }) ;
  console.log({ price }) ;
  
  // page.on('load', async () => {
  //   console.log('load event fired');
  //   const bodyHandle = await page.$('body');
  //   const title = await page.evaluate( bodyHandle => bodyHandle.querySelector('#productTitle').textContent.trim() , bodyHandle ) ;
  //   const stock = await page.evaluate( bodyHandle => bodyHandle.querySelector('#availabilityInsideBuyBox_feature_div span') , bodyHandle ) ;
  //   console.log( 'title :', title ) ;
  //   console.log( 'stock :', stock ) ;
  // });


  // const titleElem = await page.waitFor( 'body' ) ;
  // console.log( 'start' ) ;
  // await page.waitFor( 5000 ) ;
  // console.log( 'ininini' ) ;
  

  // const test = await page.waitForSelector( '#availabilityInsideBuyBox_feature_div' ) ;
  // const bodyHandle = await page.$('body');
  // const title = await page.evaluate( bodyHandle => bodyHandle.querySelector('#productTitle').textContent.trim() , bodyHandle ) ;
  // const stock = await page.evaluate( bodyHandle => bodyHandle.querySelector('#availabilityInsideBuyBox_feature_div span') , bodyHandle ) ;
  
  // console.log( 'test :', test ) ;
  // console.log( 'title :', titleElem.tagName ) ;
  /* const text = 'NBA';
  try {
    await page.waitForFunction(
      text => document.querySelector('#availabilityInsideBuyBox_feature_div') ,
      {},
      text
    );
  } catch(e) {
    console.log(`The text "${text}" was not found on the page`);
  } */

  await browser.close() ;


})() ;

/* 
console.log( '1 : ', $('#productTitle').text().trim() ) ;
    console.log( '2 : ', $('#availabilityInsideBuyBox_feature_div').length ) ;
    console.log( '3 : ', $('#availability_feature_div').text().trim() ) ;
    console.log( '4 : ', $('#bylineInfo').text() ) ;
*/