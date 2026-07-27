package com.workhub.masterdata;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MasterDataRepository extends JpaRepository<MasterDataType, Long> {
    List<MasterDataType> findByCategoryOrderByDisplayOrder(String category);
    List<MasterDataType> findByCategoryAndActiveTrueOrderByDisplayOrder(String category);
    List<MasterDataType> findByActiveTrueOrderByCategoryAscDisplayOrderAsc();
    List<MasterDataType> findAllByOrderByCategoryAscDisplayOrderAsc();
    Optional<MasterDataType> findByCategoryAndCode(String category, String code);
    boolean existsByIdAndActiveTrue(Long id);
}
