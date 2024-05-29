/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

document.addEventListener('deviceready', onDeviceReady, false);

let PIZZARIA_ID, imgAtual, listaPizzasAtual;

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    document.querySelectorAll(".btn-mudar-tela").forEach(btnMudarTela => 
        btnMudarTela.addEventListener("click", mudarTela)
    );

    document.getElementById("salvar-pizza").addEventListener("click", salvarPizza);
    document.getElementById("excluir-pizza").addEventListener("click", excluirPizza);
    document.getElementById("btn-nova-pizza").addEventListener("click", () => alternarFormulario());
    document.getElementById("tirar-foto").addEventListener("click", tirarFoto);

    imgAtual = "";
    PIZZARIA_ID = "leomiri";
    listaPizzasAtual = [];

    listarPizzas();
}

function mudarTela(event) {
    let { destino, origem } = event.target.dataset;

    document.getElementById(origem).classList.add("hidden");
    document.getElementById(destino).classList.remove("hidden");

    imgAtual = "";
}

function listarPizzas() {
    cordova.plugin.http.get(`https://pedidos-pizzaria.glitch.me/admin/pizzas/${PIZZARIA_ID}`, {}, {}, 
        (respostaOk) => {
            atualizarListaPizzas(JSON.parse(respostaOk.data));
        }, 
        (respostaErro) => {
            console.error(respostaErro);
            alert("Erro ao listar pedidos");
        }
    );
}

function atualizarListaPizzas(pizzas) {
    let listaPizzas = document.querySelector(".lista-pizzas");
    listaPizzas.innerHTML = "";

    pizzas.forEach(pizza => {
        let itemPizzaElemento = document.createElement('div');
        itemPizzaElemento.classList.add('item-pizza');
        itemPizzaElemento.appendChild(gerarPreviaFoto(pizza));
        itemPizzaElemento.appendChild(gerarTituloPizza(pizza));

        itemPizzaElemento.onclick = () => alternarFormulario(pizza);
        listaPizzas.appendChild(itemPizzaElemento);
    });
}

function gerarTituloPizza(pizza) {
    let precoFormatado = pizza.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    let tituloPizza = document.createElement('h2');
    tituloPizza.classList.add('nome-pizza');
    tituloPizza.innerText = `${pizza.pizza} | ${precoFormatado}`;
    return tituloPizza;
}

function gerarPreviaFoto(pizza) {
    let elementoPreviaFoto = document.createElement('div');
    elementoPreviaFoto.classList.add('previa-foto');

    if (pizza.imagem.startsWith('data:image/jpeg;base64,')) {
        elementoPreviaFoto.style.backgroundImage = `url(${pizza.imagem})`;
        elementoPreviaFoto.style.backgroundRepeat = 'no-repeat';
        elementoPreviaFoto.style.backgroundPosition = 'center';
        elementoPreviaFoto.style.backgroundSize = 'cover';
    } 
    
    return elementoPreviaFoto;
}

function alternarFormulario(pizza = null) {
    let inputSaborPizza = document.getElementById('sabor-pizza');
    let inputPrecoPizza = document.getElementById('preco-pizza');
    let previaFoto = document.getElementById('previa-foto');
    let btnSalvarPizza = document.getElementById("salvar-pizza");
    let btnExcluirPizza = document.getElementById("excluir-pizza");

    let novoBtnSalvarPizza = btnSalvarPizza.cloneNode(true);
    btnSalvarPizza.parentNode.replaceChild(novoBtnSalvarPizza, btnSalvarPizza);
    novoBtnSalvarPizza = document.getElementById("salvar-pizza");
    
    if (pizza) {
        inputSaborPizza.value = pizza.pizza;
        inputPrecoPizza.value = pizza.preco;
        previaFoto.style.backgroundImage = `url(${pizza.imagem})`;
        novoBtnSalvarPizza.addEventListener("click", () => atualizarPizza(pizza["_id"]));
        btnExcluirPizza.classList.remove("hidden");
    } else {
        inputSaborPizza.value = '';
        inputPrecoPizza.value = '';
        previaFoto.style.backgroundImage = '';
        novoBtnSalvarPizza.addEventListener("click", salvarPizza);
        btnExcluirPizza.classList.add("hidden");
    }

    mudarTela({ target: { dataset: { destino: 'tela-nova-pizza', origem: 'tela-lista-pizzas' } } });

    imgAtual = pizza ? pizza.imagem : "";
}

function salvarPizza() {
    let saborPizza = document.querySelector("#sabor-pizza").value;
    let precoPizza = Number.parseFloat(document.querySelector("#preco-pizza").value);

    cordova.plugin.http.setDataSerializer('json');
    
    if (imgAtual === "") {
        alert("Tire uma foto da pizza!");
    } else {
        cordova.plugin.http.post("https://pedidos-pizzaria.glitch.me/admin/pizza", {
            pizzaria: PIZZARIA_ID,
            pizza: saborPizza,
            preco: precoPizza,
            imagem: imgAtual
        }, {}, 
            (respostaOk) => {
                alert("Pizza cadastrada com sucesso!");
                listarPizzas();
                mudarTela({ target: { dataset: { destino: 'tela-lista-pizzas', origem: 'tela-nova-pizza' } } });
            }, 
            (respostaErro) => {
                console.error(respostaErro);
                alert("Erro ao cadastrar pizza");
            }
        );
    }
}

function atualizarPizza(idPizza) {
    let saborPizza = document.querySelector("#sabor-pizza").value;
    let precoPizza = Number.parseFloat(document.querySelector("#preco-pizza").value);

    cordova.plugin.http.setDataSerializer('json');
    cordova.plugin.http.put("https://pedidos-pizzaria.glitch.me/admin/pizza", {
        pizzaria: PIZZARIA_ID,
        pizzaid: idPizza,
        pizza: saborPizza,
        preco: precoPizza,
        imagem: imgAtual
    }, {}, 
        (respostaOk) => {
            alert("Pizza atualizada com sucesso!");
            listarPizzas();
            mudarTela({ target: { dataset: { destino: 'tela-lista-pizzas', origem: 'tela-nova-pizza' } } });

        }, 
        (respostaErro) => {
            console.error(respostaErro);
            alert("Erro ao atualizar pizza");
        }
    );
}

function tirarFoto() {
    let previa = document.getElementById("previa-foto");

    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
    });

    function onSuccess(imageData) {
        previa.style.backgroundImage = `url(data:image/jpeg;base64,${imageData})`;
        imgAtual = `data:image/jpeg;base64,${imageData}`;
    }

    function onFail(message) {
        alert(message);
    }

}

function excluirPizza() {

    let saborPizza = document.querySelector("#sabor-pizza").value;

    cordova.plugin.http.setDataSerializer('json');
    cordova.plugin.http.delete(encodeURI("https://pedidos-pizzaria.glitch.me/admin/pizza/" + PIZZARIA_ID + "/" + saborPizza),
    {}, {},
        (respostaOk) => {
            alert("Pizza excluída com sucesso!");
            listarPizzas();
            mudarTela({ target: { dataset: { destino: 'tela-lista-pizzas', origem: 'tela-nova-pizza' } } });

        }, 
        (respostaErro) => {
            console.error(respostaErro);
            alert("Erro ao excluir pizza");
        })
      
}