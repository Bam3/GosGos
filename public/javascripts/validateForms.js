// Example starter JavaScript for disabling form submissions if there are invalid fields
;(function () {
    'use strict'

    bsCustomFileInput.init()

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    Array.from(forms).forEach(function (form) {
        form.addEventListener(
            'submit',
            function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            },
            false,
        )
    })

    let switchElement = document.querySelector('#sharedExpenseSwitch')
    let payerSelectorElement = document.querySelector('#payerSelector')
    let payerSelectorInputElements =
        payerSelectorElement.querySelectorAll('input')

    function togglePayerSelectorVisibility() {
        let sharedExpense = switchElement.checked
        if (sharedExpense) {
            payerSelectorElement.style.display = 'block'
        } else {
            payerSelectorElement.style.display = 'none'
        }
    }
    switchElement.addEventListener('click', togglePayerSelectorVisibility)
    payerSelectorInputElements.forEach((element) => {
        element.addEventListener('click', (ev) => {
            const checkedInputs = Array.from(payerSelectorInputElements).filter(
                (input) => input.checked,
            )
            if (checkedInputs.length === 0) ev.target.checked = true
        })
    })
    togglePayerSelectorVisibility()
})()
