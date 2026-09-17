REPO_ROOT := ../../../..

.DEFAULT_GOAL := all

.PHONY: all lib test debug clean rust-test rust-clean rust-target-size \
	verify-graphiti-live lut test-artifact-paths \
	tunable-audit-report test_m0_init test_m0_rfactor test_m0_tick12 \
	test_m0_anuttara_lint \
	test_m1 test_m1_ananda \
	test_m2 test_m2_planets test_m2_aspects \
	test_m3 test_m3_clock_lut test_m3_codon_class \
	test_m4 test_m4_hash32 test_m4_oracle_faces \
	test_m5 test_pillar1 test_vak test_engine_walk_mode \
	test_kernel test_pointer_web test_m_canonical

all lib test debug clean rust-test rust-clean rust-target-size \
verify-graphiti-live lut test-artifact-paths \
tunable-audit-report test_m0_init test_m0_rfactor test_m0_tick12 \
test_m0_anuttara_lint \
test_m1 test_m1_ananda \
test_m2 test_m2_planets test_m2_aspects \
test_m3 test_m3_clock_lut test_m3_codon_class \
test_m4 test_m4_hash32 test_m4_oracle_faces \
test_m5 test_pillar1 test_vak test_engine_walk_mode \
test_kernel test_pointer_web test_m_canonical:
	$(MAKE) -C $(REPO_ROOT) $@

%:
	$(MAKE) -C $(REPO_ROOT) $@
