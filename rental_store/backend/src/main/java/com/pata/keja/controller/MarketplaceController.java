package com.pata.keja.controller;

import com.pata.keja.dto.marketplace.PackResponse;
import com.pata.keja.dto.marketplace.PackSummaryResponse;
import com.pata.keja.dto.marketplace.ProductResponse;
import com.pata.keja.dto.marketplace.ProductSummaryResponse;
import com.pata.keja.service.PackService;
import com.pata.keja.service.ProductService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.data.domain.Sort.Direction.DESC;

/** Public marketplace catalog — the frontend products and packs browsing pages. */
@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceController {

    private final ProductService productService;
    private final PackService packService;

    public MarketplaceController(ProductService productService, PackService packService) {
        this.productService = productService;
        this.packService = packService;
    }

    @GetMapping("/products")
    public Page<ProductSummaryResponse> searchProducts(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return productService.search(q, pageable);
    }

    @GetMapping("/products/{id}")
    public ProductResponse getProduct(@PathVariable String id) {
        return productService.getById(id);
    }

    @GetMapping("/packs")
    public Page<PackSummaryResponse> searchPacks(
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable) {
        return packService.search(q, pageable);
    }

    @GetMapping("/packs/{id}")
    public PackResponse getPack(@PathVariable String id) {
        return packService.getById(id);
    }
}
