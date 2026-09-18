package com.pata.keja.dto.hostel;

public record HostelFilter(
        String q,
        String location,
        Long minPrice,
        Long maxPrice,
        Boolean vacantOnly,
        Double minRating,
        SortBy sortBy) {
    public enum SortBy {
        RATING_DESC,
        PRICE_ASC,
        PRICE_DESC
    }

    public SortBy sortByOrDefault() {
        return sortBy == null ? SortBy.RATING_DESC : sortBy;
    }
}
