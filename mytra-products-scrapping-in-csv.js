/* What To Change Each Time when You Copy This code 

1. ID start with 
2. total page 
3. category 
5. filename change

*/


(async function () {
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

    const totalPages = 0; // change this to the actual total number of pages
    const allProducts = [];
    let ID =  35157; // Always change with last id of products listing in site 
        for (let page = 0; page <= totalPages; page++) {
            const productCards = document.querySelectorAll('.product-base');
            for (const card of productCards) {

                card.scrollIntoView({ behavior: 'instant', block: 'center' });
                await sleep(1000);


                const mouseOverEvent = new MouseEvent('mouseover', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                card.dispatchEvent(mouseOverEvent);

                // Wait briefly to allow DOM updates (for lazy-loaded images)
                await sleep(1500);

                ID++;
                const title = card.querySelector('.product-product')?.textContent.trim();
                const price = card.querySelector('.product-discountedPrice')?.textContent.trim() || card.querySelector('.product-price')?.textContent.trim() ;
                const category = 'Mordern Suits';
              

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
                var imagesarray = sliderImages.length > 0 ? Array.from(new Set(sliderImages)) : [mainImage]; 
                const url = 'https://www.myntra.com/' + card.querySelector('a')?.getAttribute('href');
                const { description, variants } = await getSingleProductDetails(url);

                if (!path) continue;
                allProducts.push({
                    ID, title, price, description, url, category, imagesarray, variants
                });
            }
        console.log(`Page ${page} done`);
        

        //  Go to next page
        document.querySelector('.pagination-next').click();

        //  Wait for the new page to load
        await sleep(1500); // allow time for new products to render

        //  Now scroll to the bottom to lazy-load all products on this page
        await autoScrollToBottom();

        //  Optionally wait more to ensure all images loaded
        await sleep(1000)
    }
    console.log(allProducts)
    downloadWooCommerceCSV(allProducts);
})();


