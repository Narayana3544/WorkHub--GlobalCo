package com.workhub.masterdata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterDataResponse {
    private Long id;
    private String category;
    private String code;
    private String label;
    private int displayOrder;
    private boolean active;
}
