/* What To Change Each Time when You Copy This code 

1. ID start with 
2. total page 
3. category 
5. filename change
*/


(async function () {
    
    var loadingData =  `<div class="main-site-container">
    <style>
        .main-container-inside{
            position: fixed;
            top:0;
            left:0;
            width: 100%;
            height: 100%;
            z-index: 999;
            background: rgba(0,0,0,0.7);
            color: #fff;
            display:flex;
            justify-content: center;
            align-items: center;
        }
        .mb-2{
            margin-bottom: 20px;
        }
    </style>
        <div class="main-container-inside">
            <div>
                <h2 class="pages mb-2"> Pages: <span class="done-page"> 0 </span> / <span class="total-page">1</span> </h2>
                <h2 class="count-products"> <span class="download-percentage"> </span> Downloaded...   </h2>
            </div>
        </div>
    </div>`;
    var tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = loadingData;

    // Append the parsed DOM
    document.body.appendChild(tempWrapper.firstElementChild);

   function downloadWooCommerceCSV(products, filename = "mytra_men_shirt_products.csv") {
        const csvRows = [];

        // Header
        csvRows.push([
            "ID",
            "Type",
            "Name",
            "Price",
            "Description",
            "Short Description",
            "Images",
            "Categories",
            "In stock?",
            "Parent",
            "Attribute 1 name",
            "Attribute 1 value(s)",
        ].join(","));

        for (const product of products) {
            const { ID, title, price, description = "", imagesarray:mainImage, category, variants } = product;

            
            const uniqueSizes = [...new Set(variants.map(v => v.size))].join("|");
            
            //  Variable product row
            csvRows.push([
                ID, // ID of parent
                "variable",
                `"${title}"`,
                price.replace("Rs.", ""), // price not needed for parent
                `"${description.replace(/"/g, '""')}"`, // escape quotes in description
                "", // escape quotes in description
                `"${mainImage.join(',')}"`,
                `"${category}"`,
                1, // in stock
                "", // no parent
                "size", // attribute name
                uniqueSizes,
            
            ].join(","));
            //  Deduplicate variation entries
            const uniqueVariants = [];
            const seen = new Set();
            for (const v of variants) {
                const key = `${v.size}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueVariants.push(v);
                }
            }

           //Add each variation
            for (const v of uniqueVariants) {
                csvRows.push([
                    "", // no ID (WooCommerce will auto-generate)
                    "variation",
                    `"${title}"`,
                    `${v.price}`,
                    "", // no description for variation
                    "", // no description for variation
                    `"${mainImage.join(',')}"`,
                    `"${category}"`,
                    1,
                    `id:${ID}`, // parent
                    "size",
                    v.size,
                ].join(","));
            }
        }

        // CSV Download
        const csvData = csvRows.join("\n");
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 2000);
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function autoScrollToBottom() {
        return new Promise(resolve => {
            const distance = 300;
            const delay = 100;
            const timer = setInterval(() => {
            window.scrollBy(0, distance);
            // If reached bottom
            if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
                clearInterval(timer);
                resolve();
            }
            }, delay);
        });
        }



    async function getSingleProductDetails(productUrl) {
        try {   
            const res = await fetch(productUrl,{
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
            });
            const text = await res.text();
            const match = text.match(/<script>window\.__myx\s*=\s*({.*?})<\/script>/s);
            if (!match) throw new Error("pdpData not found in HTML");
            const fullData = JSON.parse(match[1]);
            const pdpData = fullData?.pdpData;
            
            
            const description =  `${pdpData.productDetails[0].description}`;
            const variants = [];
            
            const variantNodes = (pdpData?.sizes || [])
                .filter(vdata => vdata.available)
                .map((vdata) => {
                    const label = vdata.label;
                    const seller = vdata.sizeSellerData?.[0];
                    const price = seller?.discountedPrice ?? seller?.mrp ?? null;
                    return [label, price];
                });

            variantNodes.forEach(variant => {
                const size = variant[0];
                const price = variant[1];
                variants.push({ size , price });
            });
            
            return {
                description,
                variants
            };

        } catch (err) {
            console.error(`Failed to fetch ${productUrl}`, err);
            return {
                description : description,
                variants: []
            };
        }
    }

    const totalPages = 2; // change this to the actual total number of pages
    const allProducts = [];
    let ID =  4609; // Always change with last id of products listing in site 

    document.querySelector('.total-page').innerHTML =  totalPages;
    


    for (let page = 1; page <= totalPages; page++) {
            const productCards = document.querySelectorAll('.product-base');
          
            let index = 0;
            for (const card of productCards) {
                card.scrollIntoView({ behavior: 'instant', block: 'center' });
                await sleep(500);

                const mouseOverEvent = new MouseEvent('mouseover', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                card.dispatchEvent(mouseOverEvent);

                // Wait briefly to allow DOM updates (for lazy-loaded images)
                await sleep(1000);

                ID++;
                const title = card.querySelector('.product-product')?.textContent.trim();
                const price = card.querySelector('.product-discountedPrice')?.textContent.trim() || card.querySelector('.product-price')?.textContent.trim() ;
                const category = 'Tables';
              

                 // Trigger mouseover to reveal slider images
                  // Extract slider images (after mouseover)
               const sliderImages = Array.from(card.querySelectorAll('.slick-slide picture img'))
                                    .map(img => img.src.match(/\/assets\/images\/.*/)?.[0])
                                    .filter(Boolean)
                                    .map(path => `https://assets.myntassets.com${path}`);
              
                const originalUrl = card.querySelector('picture img')?.src || '';
                var path = originalUrl.match(/\/assets\/images\/.*/)?.[0] || '';
                // Extract everything from "/assets/images/..." onwards
                // Final clean URL
                var mainImage =  `https://assets.myntassets.com${path}`;
                var imagesarray = sliderImages.length > 0 ? Array.from(new Set([mainImage,...sliderImages])) : [mainImage]; 
                const url = 'https://www.myntra.com/' + card.querySelector('a')?.getAttribute('href');
                const { description, variants } = await getSingleProductDetails(url);
                
                if (!path) continue;
                allProducts.push({
                    ID, title, price, description, url, category, imagesarray, variants
                });


                document.querySelector('.download-percentage').innerHTML =  `${ Math.floor(( index / productCards.length ) * 100 )} % `;
                index++;
            }
        document.querySelector('.done-page').innerHTML =  page;
        console.log(`Page ${page} done`);
        
        //  Go to next page
        if(document.querySelectorAll('.pagination-next').length > 0 ){
            document.querySelector('.pagination-next').click();
        }

        //  Wait for the new page to load
        await sleep(1000); // allow time for new products to render

        //  Now scroll to the bottom to lazy-load all products on this page
        await autoScrollToBottom();

        //  Optionally wait more to ensure all images loaded
        await sleep(500)
    }
    console.log(allProducts)
    document.querySelector('.main-site-container').innerHTML = "";
    if(allProducts.length > 0 ){
        downloadWooCommerceCSV(allProducts);
    }else{
        alert('product Not Found');
    }
})();


