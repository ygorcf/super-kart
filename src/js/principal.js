
//var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var graphics = null, graphicsMapa = null;
var pos = {x: 10, y:10, ang: 0, tam: 0};
var cursors;
var terrenoGrama = null, terrenoAsfaltoE = null, terrenoAsfaltoD = null, terrenoAsfaltoC = null, terrenoAsfaltoB = null, terrenoAsfaltoT = null;
var grama = {
	cor: 0x99ff66,
	atrito: 0.07,
	ePista: false,
	eChegada: false
}, asfalto = {
	cor: 0xb3b3b3,
	atrito: 0,
	ePista: true,
	eChegada: false
}, faixa = {
	cor: 0xffffff,
	atrito: 0,
	ePista: true,
	eChegada: false
};
var mapa = null, mapa2 = [];
var bmp, bmp2;
var qtds = {
	larg: 8,
	alt: 8
};
var tamMapa = {
	xmin: 0,
	ymin: 0,
	xmax: 0,
	ymax: 0
}
var res = {
  x: 128,
  y: 128,
  scale: 4
};
var carro = {
	velocidade: 0,
	aceleracao: 0.1,
	dirigibilidade: 0.05,
	velocidade_max: 2,
	pos: {
		x: 10,
		y:10,
		ang: 0,
		tam: 0
	}
};
var desaceleracaoMapa = 0.05;
var reorientacaoCarro = 0.05;
var distancia_carro = -10;
var corFora = 0x0f0f0f;
var opcoes3d = {
    space_z: 8, // A altura da camera pro chao
    horizon:  5, // O numero de pixels que a primeira linha desenhada esta abaixo do horizonte
    scale_x: 196,
    scale_y: 196, // Determina as scalas das coordenadas de espaco para as coordenadas da tela
    obj_scale_x: 200,
    obj_scale_y: 200, // Determina o tamanho relativo dos objetos
    distancia_carro: -10 // A distancia entre o carro e a tela
};
var obj = [
	[0xff0000, 0x000000, 0x000000, 0xffffff],
	[0x000000, 0xff0000, 0xff0000, 0xff0000],
	[0xff0000, 0xff0000, 0xff0000, 0x000000],
	[0xffffff, 0x000000, 0x000000, 0xff0000],
];

/*--------------------------------------------------------------------------------*/

function Coordenada(x, y) {
	this[0] = x;
	this[1] = y;
}

function Resolucao(resx, resy, escala) {
	this.x = resx;
	this.y = resy;
	this.escala = escala;
}

Resolucao.prototype.obterAltura = function () {
	return this.y * this.escala;
}

Resolucao.prototype.obterLargura = function () {
	return this.x * this.escala;
}

var Jogador = (function () {
	function Jogador(game, imgCarro, coordIni) {
		if (!(coordIni instanceof Coordenada))
			throw new Error('A posicao inicial (\'coordIni\') não é uma coordenada.');
		if (typeof img != 'string')
			throw new Error('A imagem do carro do jogador (\'imgCarro\') não é uma string.');
			
		this.coordenadas = coordIni;
		this.spriteCarro = game.add.sprite(this.coordenadas[0], this.coordenadas[1], imgCarro);
		this.velocidade = 0;
		this.aceleracao = 0.1,
		this.dirigibilidade = 0.05,
		this.velocidade_max = 2,
		this.pos = {
			x: 10,
			y:10,
			ang: 0,
			tam: 0
		};
	}
	
	
	
	return Jogador;
})();

var Jogo = (function (){
	function Jogo(res, funcs) {
		if (!(res instanceof Resolucao))
			throw new Error('O parametro \'res\' não é uma resolução valida.');
		
		this.resolucao = res;
		this.game = new Phaser.Game(this.resolucao.obterLargura(), this.resolucao.obterAltura(), Phaser.AUTO, '', funcs);
		this.graficos = null;
		this.params3d = {
			space_z: 8, // A altura da camera pro chao
			horizon:  5, // O numero de pixels que a primeira linha desenhada esta abaixo do horizonte
			scale_x: 196,
			scale_y: 196, // Determina as scalas das coordenadas de espaco para as coordenadas da tela
			obj_scale_x: 200,
			obj_scale_y: 200, // Determina o tamanho relativo dos objetos
			distancia_carro: -10 // A distancia entre o carro e a tela
		};
		this.corFora = 0xffffff;
	}

	Jogo.prototype.criarGraficos = function() {
		this.graficos = this.game.add.graphics(0, 0);
	}

	Jogo.prototype.desenhaMapa3d = function (mapa, x, y, ang) {
		let cor;
		let meioy = this.resolucao.y / 2;
		let meiox = this.resolucao.x / 2;

		for (let i = 0; i < this.resolucao.y; i++) {
			// first calculate the distance of the line we are drawing
			let distance = ((this.params3d.space_z * this.params3d.scale_y) / (i + this.params3d.horizon));
			// then calculate the horizontal scale, or the distance between
			// space points on this horizontal line
			let horizontal_scale = (distance / this.params3d.scale_x);
			// calculate the dx and dy of points in space when we step
			// through all points on this line
			let line_dx = (-(Math.sin(ang)) * horizontal_scale);
			let line_dy = (Math.cos(ang) * horizontal_scale);

			// calculate the starting position
			let space_x = x + ((this.params3d.distancia_carro + distance) * Math.cos(ang)) - this.resolucao.x/2 * line_dx;
			let space_y = y + ((this.params3d.distancia_carro + distance) * Math.sin(ang)) - this.resolucao.x/2 * line_dy;
			for (let j = 0; j < this.resolucao.x; j++) {
				if (parseInt(space_x) == x && parseInt(space_y) == y)
					cor = this.corFora;
				else{
					cor = mapa.obterCorPos(parseInt(space_x), parseInt(space_y));
					if (cor == null) cor = this.corFora;
				}
				desenhaQuadradoTela(this.graficos, cor, res.scale*j-meiox, res.scale*i-meioy, this.resolucao.escala, this.resolucao.escala);
				space_x += line_dx;
				space_y += line_dy;
			}
		}
	}

	Jogo.prototype.desenhaObj =  function (obj, objX, objY, anguloCamera, xCamera, yCamera) {
		let larg, alt;
		let telaX, telaY;

		// Calcula a posicao relativa a camera
		let objXProj = objX - xCamera;
		let objYProj = objY - yCamera;

		// Usa a transformacao de rotacao para rodar o objeto pelo angulo da camera
		let xEspaco = (objXProj * Math.cos(anguloCamera)) + (objYProj * Math.sin(anguloCamera));
		let yEspaco = -(objXProj * Math.sin(anguloCamera)) + (objYProj * Math.cos(anguloCamera));

		// Calcula as coordenadas que deve ir na tela com as coordenadas do espaco
		// dividindo tudo por xEspaco (a distancia)
		telaX = parseInt(this.resolucao.x/2 + ((this.params3d.scale_x / xEspaco) * yEspaco));
		telaY = parseInt(((this.params3d.space_z * this.params3d.scale_y) / xEspaco) - this.params3d.horizon);

		// O tamanho do objeto deve ser escalonado de acordo com a distancia
		alt = parseInt(obj.height * (this.params3d.obj_scale_y / xEspaco));
		larg = parseInt(obj.width * (this.params3d.obj_scale_x / xEspaco));

		// draw the object
		//desenhaobjTela(grafics, obj, telaX - larg / 2, telaY - alt, larg, alt);
		obj.x = telaX - larg / 2;
		obj.y = telaY - alt;
		obj.width = larg;
		obj.height = alt;

	}
	
	function desenhaQuadradoTela(grafics, cor, x, y, larg, alt) {
		grafics.beginFill(cor, 1);
		grafics.drawRect(x, y, larg, alt, cor);
		grafics.endFill();
	}
	
	
	return Jogo;
})();

function Mapa(jogo, imgMapa) {
	if (!(typeof imgMapa == 'string'))
		throw new Error('A imagem do mapa (\'imgMapa\') não é uma string');
	if (!(jogo instanceof Jogo))
		throw new Error('O parametro \'jogo\' não é valido');

	let imgCache = jogo.game.cache.getImage(imgMapa);
	let altImg = imgCache.height;
	let larImg = imgCache.width;

	this.bitmap = jogo.game.make.bitmapData(larImg, altImg);
	this.bitmap.draw(imgCache, 0, 0);
	this.bitmap.update();

	this.largura = larImg;
	this.altura = altImg;
}

Mapa.prototype.obterCorPos = function (x, y) {
	let posX = parseInt(x);
	if (posX < 0 || posX >= mapa.largura) {
		return null;
	}
	let posY = parseInt(y);
	if (posY < 0 || posY >= mapa.altura) {
		return null;
	}
	return mapa.bitmap.getPixelRGB(posX, posY).color;
}

var uno;
var resJogo = new Resolucao(128, 128, 4);
var jogo = new Jogo(resJogo, { preload: preload, create: create, update: update });
var game = jogo.game;
var graphicsMapa = jogo.graficos;
var nomeMapa = 'mapa1';
var mapa = null;

function preload() {
	terrenoGrama = [
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama]
	];
	terrenoAsfaltoE = [
		[asfalto, asfalto, asfalto, asfalto, grama, grama, grama, grama],
		[asfalto, asfalto, asfalto, asfalto, grama, grama, grama, grama],
		[faixa, asfalto, asfalto, asfalto, grama, grama, grama, grama],
		[faixa, asfalto, asfalto, asfalto, grama, grama, grama, grama],
		[faixa, asfalto, asfalto, asfalto, grama, grama, grama, grama],
		[faixa, asfalto, asfalto, asfalto, grama, grama, grama, grama],
		[asfalto, asfalto, asfalto, asfalto, grama, grama, grama, grama],
		[asfalto, asfalto, asfalto, asfalto, grama, grama, grama, grama]
	];
	terrenoAsfaltoD = [
		[grama, grama, grama, grama, asfalto, asfalto, asfalto, asfalto],
		[grama, grama, grama, grama, asfalto, asfalto, asfalto, asfalto],
		[grama, grama, grama, grama, asfalto, asfalto, asfalto, faixa],
		[grama, grama, grama, grama, asfalto, asfalto, asfalto, faixa],
		[grama, grama, grama, grama, asfalto, asfalto, asfalto, faixa],
		[grama, grama, grama, grama, asfalto, asfalto, asfalto, faixa],
		[grama, grama, grama, grama, asfalto, asfalto, asfalto, asfalto],
		[grama, grama, grama, grama, asfalto, asfalto, asfalto, asfalto]
	];
	terrenoAsfaltoC = [
		[asfalto, asfalto, faixa, faixa, faixa, faixa, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama]
	];
	terrenoAsfaltoB = [
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[grama, grama, grama, grama, grama, grama, grama, grama],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, faixa, faixa, faixa, faixa, asfalto, asfalto]
	];
	terrenoAsfaltoT = [
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto],
		[asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto, asfalto]
	];
	mapa = [
		[terrenoGrama,	terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoB,	terrenoAsfaltoB,	terrenoAsfaltoB, 	terrenoAsfaltoB, 	terrenoAsfaltoB, 	terrenoAsfaltoB, 	terrenoGrama, 		terrenoGrama, 		terrenoGrama],
		[terrenoGrama,	terrenoGrama,		terrenoAsfaltoT,	terrenoAsfaltoT,	terrenoAsfaltoT,	terrenoAsfaltoT, 	terrenoAsfaltoT, 	terrenoAsfaltoT, 	terrenoAsfaltoT, 	terrenoAsfaltoT,	terrenoGrama, 		terrenoGrama],
		[terrenoGrama,	terrenoGrama,		terrenoAsfaltoT, 	terrenoAsfaltoT,	terrenoAsfaltoC,	terrenoAsfaltoC, 	terrenoAsfaltoC, 	terrenoAsfaltoC, 	terrenoAsfaltoT, 	terrenoAsfaltoT, 	terrenoGrama, 		terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama,		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama,		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama,		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama,		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoAsfaltoD,	terrenoAsfaltoT, 	terrenoAsfaltoE,	terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoGrama, 		terrenoAsfaltoD, 	terrenoAsfaltoT, 	terrenoAsfaltoE, 	terrenoGrama],
		[terrenoGrama,	terrenoGrama, 		terrenoAsfaltoT, 	terrenoAsfaltoT,	terrenoAsfaltoB, 	terrenoAsfaltoB, 	terrenoAsfaltoB,	terrenoAsfaltoB, 	terrenoAsfaltoT, 	terrenoAsfaltoT, 	terrenoGrama, 		terrenoGrama],
		[terrenoGrama,	terrenoGrama,		terrenoAsfaltoT,	terrenoAsfaltoT,	terrenoAsfaltoT,	terrenoAsfaltoT, 	terrenoAsfaltoT, 	terrenoAsfaltoT, 	terrenoAsfaltoT, 	terrenoAsfaltoT,	terrenoGrama, 		terrenoGrama],
		[terrenoGrama,	terrenoGrama,		terrenoGrama, 		terrenoAsfaltoC,	terrenoAsfaltoC, 	terrenoAsfaltoC, 	terrenoAsfaltoC, 	terrenoAsfaltoC, 	terrenoAsfaltoC, 	terrenoGrama, 		terrenoGrama, 		terrenoGrama]
	];

	jogo.game.load.image('uno', 'assets/uno.png');
	jogo.game.load.image(nomeMapa, 'assets/mapa1.bmp');
	//bmp = game.add.bitmapData(res.x, res.y);
}

function create() {

    jogo.criarGraficos();
    mapa = new Mapa(jogo, nomeMapa);

	let pos2 = getCartesianCoord(pos.tam, pos.ang);

	//mapa2 = copiaMapa2(mapa);
	tamMapa.xmin = 0;
	tamMapa.xmax = mapa.largura;
	tamMapa.ymin = 0;
	tamMapa.ymax = mapa.altura;
	// let posFinalLinha = getCartesianCoord(2, pos.ang);
	//jogo.desenhaObj();*/
	jogo.desenhaMapa3d(mapa, carro.pos.x, carro.pos.y, carro.pos.ang);
	//desenha3d(mapa2, res.x, res.y, qtds.larg, qtds.alt, carro.pos.x, carro.pos.y, carro.pos.ang, opcoes3d);
	//desenhaobjTela(graphicsMapa, obj, 200, 20, 40, 40);
	//var sprite = game.add.sprite(0, 0, bmp);

    cursors = jogo.game.input.keyboard.createCursorKeys();
    let posxCarro = (res.x * (res.scale-0.5))/2 - 32;
    let posyCarro = (res.y * (res.scale - 0.5)) + distancia_carro * (res.scale) - 32;
    uno = jogo.game.add.sprite(posxCarro, posyCarro, 'uno');
}

function update() {
	let atualiza = false;

	if (carro.velocidade != 0) {
		if (carro.velocidade < desaceleracaoMapa) {
			atualiza = false;
			carro.velocidade = 0;
		} else {
			atualiza = true;
			carro.velocidade -= desaceleracaoMapa;
		}
	}
	/*if (carro.pos.ang != 0)
		if (carro.pos.ang < reorientacaoCarro && carro.pos.ang > -reorientacaoCarro) {
			carro.pos.ang = 0;
			atualiza = false;
		} else if (carro.pos.ang <= -reorientacaoCarro) {
			carro.pos.ang += reorientacaoCarro;
			atualiza = true;
		} else {
			carro.pos.ang -= reorientacaoCarro;
			atualiza = true;
		}*/

	if (cursors.up.isDown) {
		if (carro.velocidade < carro.velocidade_max) {
			carro.velocidade += carro.aceleracao;
		}
		carro.velocidade -= obterAtritoMapa(mapa2, carro.pos.x, carro.pos.y);
		//pos.y--;
		//pos.tam += 0.001;
		// pos.tam += 0.000001;
		// let pos2 = getCartesianCoord(pos.tam, pos.ang);
		// pos.x += pos2.x;
		// pos.y += pos2.y;
		atualiza = true;
	}
	if (cursors.down.isDown){
		if (carro.velocidade > -carro.velocidade_max) {
			carro.velocidade -=  10*carro.aceleracao;
		}
		carro.velocidade += obterAtritoMapa(mapa2, carro.pos.x, carro.pos.y);
		//pos.y++;
		//pos.tam -= 0.001;
		// pos.tam -= 0.000001;
		// let pos2 = getCartesianCoord(pos.tam, pos.ang);
		// pos.x -= pos2.x;
		// pos.y -= pos2.y;
		atualiza = true;
	}
	if (cursors.left.isDown){
		//pos.x--;
		if (carro.velocidade != 0) {
			if (carro.velocidade > 0)
				carro.pos.ang -= carro.dirigibilidade;
			if (carro.velocidade < 0)
				carro.pos.ang += carro.dirigibilidade;
			if (carro.pos.ang < 0)
			carro.pos.ang += 2 * Math.PI;
			atualiza = true;
		}
	}
	if (cursors.right.isDown){
		//pos.x++;
		if (carro.velocidade != 0) {
			if (carro.velocidade > 0)
				carro.pos.ang += carro.dirigibilidade;
			if (carro.velocidade < 0)
				carro.pos.ang -= carro.dirigibilidade;

			if (carro.pos.ang > 2 * Math.PI)
			carro.pos.ang -= 2 * Math.PI;
			atualiza = true;
		}
	}
	if (atualiza) {
		let deslocamento = getCartesianCoord(carro.velocidade, carro.pos.ang);
		if (carro.pos.x + deslocamento.x < tamMapa.xmax && carro.pos.x + deslocamento.x > tamMapa.xmin)
			carro.pos.x += deslocamento.x;
		if (carro.pos.y + deslocamento.y < tamMapa.ymax && carro.pos.y + deslocamento.y > tamMapa.ymin)
			carro.pos.y += deslocamento.y;
    	jogo.graficos.clear();
		jogo.desenhaMapa3d(mapa, carro.pos.x, carro.pos.y, carro.pos.ang);
		//desenha3d(mapa2, res.x, res.y, qtds.larg, qtds.alt, carro.pos.x, carro.pos.y, carro.pos.ang, opcoes3d);
		let posCarroTela = getCartesianCoord(parseInt(distancia_carro/2), carro.pos.ang);
		//desenhaobjTela(graphicsMapa, obj, 10, 20, 40, 40);
		//desenhaObj(graphicsMapa, res.x, res.y, obj, carro.pos.x + posCarroTela.x, carro.pos.y + posCarroTela.y, carro.pos.ang, carro.pos.x, carro.pos.y, opcoes3d)
	}
}

function getCartesianCoord(tam, ang) {
  let x = tam * Math.cos(ang);
  let y = tam * Math.sin(ang);
  return {x: x, y: y};
}

function desenhaMapa(mapa, telaX, telaY) {
	let pixelsAlturaBloco, pixelsLarguraBloco;
	pixelsLarguraBloco = telaX / mapa[0].length;
	pixelsAlturaBloco = telaY / mapa.length;

	for (let i in mapa) {
		for (let j in mapa[i]) {
			//desenhaBloco(mapa[j][i], pixelsAlturaBloco, pixelsLarguraBloco, i, j);
			desenhaMapaMiniBloco(mapa[j][i], i * pixelsLarguraBloco, j * pixelsAlturaBloco, pixelsAlturaBloco, pixelsLarguraBloco);
		}
	}
}

function desenhaBloco(bloco, pixelsAlturaBloco, pixelsLarguraBloco, posX, posY) {
	let largMiniBloco, altMiniBloco;
	largMiniBloco = pixelsLarguraBloco / bloco[0].length;
	altMiniBloco = pixelsAlturaBloco / bloco.length;
	let x, y;

	/*for (let i in bloco) {
		for (let j in bloco[i]) {*/
			x = posX * pixelsLarguraBloco + i * largMiniBloco;
			y = posY * pixelsAlturaBloco + j * altMiniBloco;
			desenhaMiniBloco(bloco[j][i], x, y, pixelsAlturaBloco, pixelsLarguraBloco);
	/*	}
	}*/
}

function desenhaMiniBloco(cor, x, y, alt, larg) {
	bmp.ctx.beginPath();
	bmp.ctx.rect(x,y,larg,alt);
	bmp.ctx.fillStyle = cor;
	bmp.ctx.fill();
	//bmp.rect(x,y,larg,alt, cor);
}

function desenhaMapaMiniBloco(cor, x, y, alt, larg) {
	let meiox = res.x / 2;
	let meioy = res.y / 2;
    	//graphicsMapa.lineStyle(5, 0x0000ff, 1);
		graphicsMapa.beginFill(cor, 1);
//		graphicsMapa.moveTo(pos.x, pos.y);
	graphicsMapa.drawRect(x,y,larg,alt, cor);
		//graphicsMapa.lineTo(posFinalLinha.x + pos.x, posFinalLinha.y + pos.y);
		//graphics.lineTo(posFinalLinha.x + pos2.x, posFinalLinha.y + pos2.y);
		graphicsMapa.endFill();
}

function copiaMapa(mapaDst, mapa) {
	let pixelsAlturaBloco, pixelsLarguraBloco;
	pixelsLarguraBloco = mapa[0].length;
	pixelsAlturaBloco = mapa.length;

	for (let i in mapa) {
		for (let j in mapa[i]) {
			copiaBloco(mapaDst, mapa[j][i], pixelsAlturaBloco * j, pixelsLarguraBloco * i);
		}
	}
}

function copiaBloco(mapaDst, bloco, pixelsAlturaBloco, pixelsLarguraBloco) {
	let x, y;

	for (let i in bloco) {
		for (let j in bloco[i]) {
			x = pixelsLarguraBloco + parseInt(i);
			y = pixelsAlturaBloco + parseInt(j);
			if (mapaDst[x] == undefined)
				mapaDst[x] = [];
			mapaDst[x][y] = bloco[j][i];
		}
	}
}

function copiaMapa2(mapaFonte) {
	let linFonte = 0, colFonte = 0, linDst = 0, colDst = 0;
	let alturaFonte, larguraFonte, alturaBloco, larguraBloco;
	let mapaCopia = null;

	alturaBloco = mapaFonte[0][0].length;
	larguraBloco = mapaFonte[0][0][0].length;
	alturaFonte = mapaFonte.length * alturaBloco;
	larguraFonte = mapaFonte[0].length * larguraBloco;

	mapaCopia = new Array(alturaFonte);
	for (let i = 0; i < alturaFonte; i++)
		mapaCopia[i] = new Array(larguraFonte);

	for (let i = 0; i < mapaFonte.length; i++) {
		for (let j = 0; j < mapaFonte[0].length; j++) {
			for (let k = 0; k < alturaBloco; k++) {
				for (let l = 0; l < larguraBloco; l++) {
					linFonte = i * alturaBloco + k;
					colFonte = j * larguraBloco + l;

					mapaCopia[linFonte][colFonte] = mapaFonte[i][j][k][l];
				}
			}
		}
	}
	return mapaCopia;
}

function desenha3d(mapa, resx, resy, qtdAlt, qtdLarg, x, y, ang, params3d) {
	let horizon = 0.01;
	let fov = 10;
	let scale = 196;
	let alt = 0;
	let pixAlt = resy / qtdAlt;
	let pixLarg = resx / qtdLarg;

	let px, py, pz, sx, sy, cor1, cor2, rx, ry;
	let posxMapa, posyMapa;
	let meioy = resy / 2;
	let meiox = resx / 2;
	let ret = [];
	let mask_x = (mapa.length - 1);
	let mask_y = (mapa[0].length - 1);
	// for (let i = -meioy; i < meioy; i++) {
	// 	for (let j = -meiox; j < meiox; j++) {
	for (let i = alt; i < resy; i++) {
		// first calculate the distance of the line we are drawing
		let distance = ((params3d.space_z * params3d.scale_y) / (i + params3d.horizon));
		// then calculate the horizontal scale, or the distance between
		// space points on this horizontal line
		let horizontal_scale = (distance / params3d.scale_x);
		// calculate the dx and dy of points in space when we step
		// through all points on this line
		let line_dx = (-(Math.sin(ang)) * horizontal_scale);
		let line_dy = (Math.cos(ang) * horizontal_scale);

		// calculate the starting position
		let space_x = x + ((params3d.distancia_carro + distance) * Math.cos(ang)) - resx/2 * line_dx;
		let space_y = y + ((params3d.distancia_carro + distance) * Math.sin(ang)) - resx/2 * line_dy;
		for (let j = 0; j < resx; j++) {
			if (parseInt(space_x) == x && parseInt(space_y) == y)
				cor1 = corFora;
			else
				cor1 = obterCorMapa(mapa, parseInt(space_x), parseInt(space_y));
			desenhaMapaMiniBloco(cor1, res.scale*j-meiox, res.scale*i-meioy, res.scale, res.scale);
			space_x += line_dx;
			space_y += line_dy;
		}
	}
}

function obterCorMapa(mapa, posx, posy) {
	let posX = parseInt(posx);
	if (posX < 0 || posX >= mapa.length) {
		// console.log('posX: ' + posX);
		return corFora;
	}
	let posY = parseInt(posy + (mapa[posX].length / 2));
	if (posY < 0 || posY >= mapa[posX].length) {
		// console.log('posY: ' + posY);
		return corFora;
	}
	return mapa[posX][posY].cor;
}

function obterAtritoMapa(mapa, posx, posy) {
	let posX = parseInt(posx);
	if (posX < 0 || posX >= mapa.length) {
		// console.log('posX: ' + posX);
		return 0;
	}
	let posY = parseInt(posy + (mapa[posX].length / 2));
	if (posY < 0 || posY >= mapa[posX].length) {
		// console.log('posY: ' + posY);
		return 0;
	}
	return mapa[posX][posY].atrito;
}

function desenhaObj(grafics, resx, resy, obj, objX, objY, anguloCamera, xCamera, yCamera, params3d) {
	let larg, alt;
	let telaX, telaY;

	// Calcula a posicao relativa a camera
	let objXProj = objX - xCamera;
	let objYProj = objY - yCamera;

    // Usa a transformacao de rotacao para rodar o objeto pelo angulo da camera
	let xEspaco = (objXProj * Math.cos(anguloCamera)) + (objYProj * Math.sin(anguloCamera));
	let yEspaco = -(objXProj * Math.sin(anguloCamera)) + (objYProj * Math.cos(anguloCamera));

	// Calcula as coordenadas que deve ir na tela com as coordenadas do espaco
	// dividindo tudo por xEspaco (a distancia)
	telaX = parseInt(resx/2 + ((params3d.scale_x / xEspaco) * yEspaco));
	telaY = parseInt(((params3d.space_z * params3d.scale_y) / xEspaco) - params3d.horizon);

	// O tamanho do objeto deve ser escalonado de acordo com a distancia
	alt = parseInt(obj[0].length * (params3d.obj_scale_y / xEspaco));
	larg = parseInt(obj.length * (params3d.obj_scale_x / xEspaco));

	// Desenha o objeto

    // draw the object
    //desenhaobjTela(grafics, obj, telaX - larg / 2, telaY - alt, larg, alt);
		uno.x = telaX - larg / 2;
		uno.y = telaY - alt;
		uno.width = larg;
		uno.height = alt;

}


function desenhaobjTela(grafics, obj, x, y, larg, alt) {
	let largPix = larg / obj.length;
	let altPix;
	for (let i in obj) {
		altPix = alt / obj[i].length;
		for (let j in obj[i]) {
			grafics.beginFill(obj[i][j], 1);
			grafics.drawRect(x + i * largPix,y + j * altPix,largPix,altPix, obj[i][j]);
			grafics.endFill();
		}
	}
}
