document.addEventListener('DOMContentLoaded', () => {
    // --- Data from the document ---
    const dosageData = {
        "急性外伤/体表炎症": { min: 1, max: 4 },
        "慢性外伤/体表炎症": { min: 4, max: 30 },
        "急性浅层疼痛": { min: 2, max: 4 },
        "急性深部疼痛": { min: 3, max: 6 },
        "慢性疼痛": { min: 6, max: 20 }
    };

    const powerData = {
        "皮肤/黏膜": { "小": { min: 1, max: 3 }, "中": { min: 1, max: 3 }, "大": { min: 1, max: 3 } },
        "肢端": { "小": { min: 3, max: 4 }, "中": { min: 4, max: 5 }, "大": { min: 5, max: 6 } },
        "肩关节": { "小": { min: 4, max: 5 }, "中": { min: 5, max: 6 }, "大": { min: 6, max: 7 } },
        "膝关节": { "小": { min: 3, max: 4 }, "中": { min: 4, max: 5 }, "大": { min: 5, max: 6 } },
        "髋关节/胸腰椎": { "小": { min: 6, max: 9 }, "中": { min: 9, max: 12 }, "大": { min: 12, max: 15 } },
        "颈部": { "小": { min: 5, max: 7 }, "中": { min: 7, max: 9 }, "大": { min: 9, max: 12 } }
    };

    const symptomsByArea = {
        "皮肤/黏膜": ["急性外伤/体表炎症", "慢性外伤/体表炎症"],
        "other": ["急性浅层疼痛", "急性深部疼痛", "慢性疼痛"]
    };

    // --- DOM Elements ---
    const animalSizeRadios = document.querySelectorAll('input[name="animalSize"]');
    const treatmentAreaRadios = document.querySelectorAll('input[name="treatmentArea"]');
    const symptomsContainer = document.getElementById('symptomsContainer');
    const recommendedDosageEl = document.getElementById('recommendedDosage');
    const recommendedPowerEl = document.getElementById('recommendedPower');

    const areaSizeInput = document.getElementById('areaSize');
    const dosageInput = document.getElementById('dosageInput');
    const powerInput = document.getElementById('powerInput');
    const calculateTimeBtn = document.getElementById('calculateTimeBtn');
    const calculatedTimeEl = document.getElementById('calculatedTime');
    const powerWarningEl = document.getElementById('powerWarning');

    const recordSummaryOutput = document.getElementById('recordSummaryOutput'); // Get the summary textarea
    const copyFeedbackEl = document.getElementById('copyFeedback'); // Get the feedback span

    // --- Functions ---

    function updateSymptomOptions() {
        const selectedArea = document.querySelector('input[name="treatmentArea"]:checked').value;
        const symptoms = (selectedArea === "皮肤/黏膜") ? symptomsByArea["皮肤/黏膜"] : symptomsByArea["other"];

        symptomsContainer.innerHTML = ''; // Clear previous options

        symptoms.forEach((symptom, index) => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'symptom';
            radio.value = symptom;
            radio.id = `symptom_${index}`;
            if (index === 0) {
                radio.checked = true;
            }
            radio.addEventListener('change', updateRecommendations); // Add listener to new radio

            label.htmlFor = `symptom_${index}`;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(` ${symptom}`));
            symptomsContainer.appendChild(label);
        });
    }

    function updateRecommendations() {
        const selectedSize = document.querySelector('input[name="animalSize"]:checked')?.value;
        const selectedArea = document.querySelector('input[name="treatmentArea"]:checked')?.value;
        const selectedSymptom = document.querySelector('input[name="symptom"]:checked')?.value;

        if (selectedSymptom && dosageData[selectedSymptom]) {
            const dosage = dosageData[selectedSymptom];
            recommendedDosageEl.textContent = `${dosage.min} - ${dosage.max} J/cm²`;
        } else {
            recommendedDosageEl.textContent = '--';
        }

        if (selectedArea && selectedSize && powerData[selectedArea] && powerData[selectedArea][selectedSize]) {
            const power = powerData[selectedArea][selectedSize];
            recommendedPowerEl.textContent = `${power.min} - ${power.max} W`;
        } else {
            recommendedPowerEl.textContent = '--';
        }
    }

    function calculateTime() {
        const area = parseFloat(areaSizeInput.value);
        const dosage = parseFloat(dosageInput.value);
        const power = parseFloat(powerInput.value);

        // Clear summary and feedback first
        recordSummaryOutput.value = '';
        copyFeedbackEl.style.visibility = 'hidden';


        if (isNaN(area) || isNaN(dosage) || isNaN(power) || area < 0 || dosage < 0 || power <= 0) {
             if (power === 0) {
                 calculatedTimeEl.textContent = '功率不能为0!';
             } else {
                 calculatedTimeEl.textContent = '请输入有效的数值 (面积, 剂量 ≥ 0, 功率 > 0)';
             }
             powerWarningEl.style.display = 'none'; // Hide power warning if inputs are invalid
             return;
        }


        const timeInSeconds = (area * dosage) / power;
        const timeFormatted = timeInSeconds.toFixed(2); // Format time to 2 decimal places

        calculatedTimeEl.textContent = `${timeFormatted} 秒`;

        // --- Update Record Summary ---
        const summaryText = `照射面积共约 ${area} (cm²)，剂量 ${dosage} (J/cm²)\n功率：${power} (W)    时间：${timeFormatted} (秒)`;
        recordSummaryOutput.value = summaryText;
        // --- End Update Record Summary ---
    }

    function checkPowerWarning() {
        const powerValue = parseFloat(powerInput.value);
        if (!isNaN(powerValue) && powerValue >= 10) {
            powerWarningEl.style.display = 'inline'; // Show warning
        } else {
            powerWarningEl.style.display = 'none'; // Hide warning
        }
    }

    // Function to copy text from the summary textarea
    function copySummaryToClipboard() {
        if (!recordSummaryOutput.value) return; // Don't copy if empty

        recordSummaryOutput.select(); // Select the text
        recordSummaryOutput.setSelectionRange(0, 99999); // For mobile devices

        try {
            // Use Clipboard API
            navigator.clipboard.writeText(recordSummaryOutput.value).then(() => {
                // Show feedback
                copyFeedbackEl.style.visibility = 'visible';
                // Hide feedback after a short delay
                setTimeout(() => {
                    copyFeedbackEl.style.visibility = 'hidden';
                }, 1500); // Hide after 1.5 seconds
            }).catch(err => {
                console.error('无法复制到剪贴板: ', err);
                // Fallback for older browsers (less reliable)
                // try {
                //    document.execCommand('copy');
                //    // Show feedback (same as above)
                // } catch (err) {
                //    console.error('使用 execCommand 复制失败: ', err);
                // }
            });
        } catch (err) {
            console.error('剪贴板 API 不可用: ', err);
             // Potentially show an alert or other message if clipboard is unavailable
        }

        // Deselect text after attempting copy
         window.getSelection().removeAllRanges();
    }


    // --- Event Listeners ---
    animalSizeRadios.forEach(radio => radio.addEventListener('change', updateRecommendations));
    treatmentAreaRadios.forEach(radio => radio.addEventListener('change', () => {
        updateSymptomOptions();
        updateRecommendations();
    }));
    calculateTimeBtn.addEventListener('click', calculateTime);
    powerInput.addEventListener('input', checkPowerWarning);

    // Add click listener to the summary textarea for copying
    recordSummaryOutput.addEventListener('click', copySummaryToClipboard);


    // --- Initial Setup ---
    updateSymptomOptions();
    updateRecommendations();
    checkPowerWarning();
});