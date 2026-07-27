package com.workhub.masterdata.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMasterDataRequest {

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Label is required")
    private String label;

    @Min(value = 0, message = "Display order must be non-negative")
    private int displayOrder;
}
