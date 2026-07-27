package com.workhub.masterdata;

import com.workhub.masterdata.dto.CreateMasterDataRequest;
import com.workhub.masterdata.dto.MasterDataResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MasterDataService {

    private final MasterDataRepository repository;

    public MasterDataService(MasterDataRepository repository) {
        this.repository = repository;
    }

    /**
     * Get all active master data grouped by category (public endpoint).
     */
    @Transactional(readOnly = true)
    public Map<String, List<MasterDataResponse>> getAllActiveGrouped() {
        List<MasterDataType> items = repository.findByActiveTrueOrderByCategoryAscDisplayOrderAsc();
        Map<String, List<MasterDataResponse>> grouped = new LinkedHashMap<>();
        items.stream()
                .map(this::toResponse)
                .forEach(r -> grouped.computeIfAbsent(r.getCategory(), k -> new java.util.ArrayList<>()).add(r));
        return grouped;
    }

    /**
     * Get all master data including inactive (admin).
     */
    @Transactional(readOnly = true)
    public List<MasterDataResponse> getAll() {
        return repository.findAllByOrderByCategoryAscDisplayOrderAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MasterDataResponse create(CreateMasterDataRequest request) {
        if (repository.findByCategoryAndCode(request.getCategory(), request.getCode()).isPresent()) {
            throw new IllegalArgumentException(
                    "Master data with category '" + request.getCategory() + "' and code '" + request.getCode() + "' already exists");
        }

        MasterDataType entity = new MasterDataType();
        entity.setCategory(request.getCategory().toUpperCase());
        entity.setCode(request.getCode().toUpperCase());
        entity.setLabel(request.getLabel());
        entity.setDisplayOrder(request.getDisplayOrder());
        entity.setActive(true);

        return toResponse(repository.save(entity));
    }

    @Transactional
    public MasterDataResponse update(Long id, CreateMasterDataRequest request) {
        MasterDataType entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Master data not found with id: " + id));

        entity.setLabel(request.getLabel());
        entity.setDisplayOrder(request.getDisplayOrder());
        // Category and code are immutable after creation

        return toResponse(repository.save(entity));
    }

    @Transactional
    public void softDelete(Long id) {
        MasterDataType entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Master data not found with id: " + id));
        entity.setActive(false);
        repository.save(entity);
    }

    /**
     * Validate that a master data ID exists, is active, and belongs to the expected category.
     */
    @Transactional(readOnly = true)
    public void validateMasterDataId(Long id, String expectedCategory) {
        MasterDataType entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid master data ID: " + id));
        if (!entity.isActive()) {
            throw new IllegalArgumentException("Master data with ID " + id + " is inactive");
        }
        if (!entity.getCategory().equals(expectedCategory)) {
            throw new IllegalArgumentException(
                    "Master data ID " + id + " belongs to category '" + entity.getCategory()
                            + "', expected '" + expectedCategory + "'");
        }
    }

    private MasterDataResponse toResponse(MasterDataType entity) {
        return MasterDataResponse.builder()
                .id(entity.getId())
                .category(entity.getCategory())
                .code(entity.getCode())
                .label(entity.getLabel())
                .displayOrder(entity.getDisplayOrder())
                .active(entity.isActive())
                .build();
    }
}
