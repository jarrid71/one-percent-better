// utils/productLookup.ts

export type ProductLookupResult = {
  barcode: string;
  name: string;
  quantity: string;
  brand: string;
  imageUrl: string;
  found: boolean;
};

export async function lookupProductByBarcode(
  barcode: string
): Promise<ProductLookupResult> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    const result = await response.json();
    const product = result?.product;

    if (!product) {
      return {
        barcode,
        name: barcode,
        quantity: "",
        brand: "",
        imageUrl: "",
        found: false,
      };
    }

    const brandName = product.brands?.trim() || "";

    const productLabel =
      product.product_name?.trim() ||
      product.generic_name?.trim() ||
      "";

    const productName =
      brandName && productLabel
        ? `${brandName} ${productLabel}`
        : productLabel || brandName || barcode;

    return {
      barcode,
      name: productName,
      quantity: product.quantity?.trim() || "",
      brand: brandName,
      imageUrl: product.image_front_url || product.image_url || "",
      found: true,
    };
  } catch (error) {
    console.log("Product lookup failed:", error);

    return {
      barcode,
      name: barcode,
      quantity: "",
      brand: "",
      imageUrl: "",
      found: false,
    };
  }
}