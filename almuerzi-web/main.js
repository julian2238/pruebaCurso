let mealsState = []
let ruta = 'login'
let user = {}
let tokenn


const stringtoHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s, 'text/html')

    return doc.body.firstChild
}
const renderItem = (item) => {
    const element = stringtoHTML(`<li data-id="${item._id}">${item.name}</li>`)

    element.addEventListener('click', () => {

        const mealList = document.getElementById('meals-list')
        Array.from(mealList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value = item._id
    })

    return element
}

const renderOrder = (order, meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringtoHTML(`<li data-id="${order._id}">${meal.name} ${order.user_id}</li>`)

    return element
}

const inicializar = () => {
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealsId = document.getElementById('meals-id')
        const mealsIDValue = mealsId.value
        if (!mealsIDValue) {
            alert('Debe seleccionar un plato')
            submit.removeAttribute('disabled')
            return
        }

        const order = {
            meal_id: mealsIDValue,
            user_id: user._id,
        }

        fetch('https://serverless.julian2238.vercel.app/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': "application/json",
                //authorization: token,
            },
            body: JSON.stringify(order),
        })
            .then(x => x.json())
            .then(respuesta => {
                const renderedOrder = renderOrder(respuesta, mealsState)
                const ordersList = document.getElementById('orders-list')
                ordersList.appendChild(renderedOrder)
                submit.removeAttribute('disabled')
            })
    }
}

const inicializarDatos = () => {
    fetch('https://serverless.julian2238.vercel.app/api/meals')
        .then(response => response.json())
        .then(data => {
            mealsState = data
            const mealList = document.getElementById('meals-list')
            const submit = document.getElementById('submit')
            const listItems = data.map(renderItem)
            mealList.removeChild(mealList.firstElementChild)
            listItems.forEach(element => mealList.appendChild(element));
            submit.removeAttribute('disabled')

            fetch('https://serverless.julian2238.vercel.app/api/orders')
                .then(response => response.json())
                .then(ordersData => {
                    const ordersList = document.getElementById('orders-list')
                    const listOders = ordersData.map(orderData => renderOrder(orderData, data))

                    ordersList.removeChild(ordersList.firstElementChild)
                    listOders.forEach(element => ordersList.appendChild(element))

                })
        })
}

const renderApp = () => {
    const token = localStorage.getItem('token')
    if (token) {
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders()
    }
    renderLogin()
}

const renderOrders = () => {
    const ordersView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML
    inicializar()
    inicializarDatos()
}

const renderLogin = () => {
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML

    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        fetch('https://serverless.julian2238.vercel.app/api/auth/login', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        }).then(x => x.json())
            .then(respuesta => {
                localStorage.setItem('token', respuesta.token)
                ruta = 'orders'
                return respuesta.token
            })
            .then(token => {
                return fetch('https://serverless.julian2238.vercel.app/api/auth/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: token,
                    },
                })
                    .then(x => x.json())
                    .then(fetchedUser => {
                        localStorage.setItem('user', JSON.stringify(fetchedUser))
                        user = fetchedUser
                        renderOrders()
                    })
            })

    }
}

window.onload = () => {
    renderApp()

}
