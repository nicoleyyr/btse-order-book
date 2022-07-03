<template>
	<div class="table">
		<p class="table-title">Order Book</p>
		<div class="table-content-row table-content-row-head">
			<p class="table-head">Price(USD)</p>
			<p class="table-head">Size</p>
			<p class="table-head">Total</p>
		</div>
		<template v-for="(quote, index) in sellQuote" :key="quote-index">
			<div class="table-content-row table-content-row-body table-content-row-body-sell" :data-index="'sell-' + index" v-if="index <= 7" :class="{'new-price': differentSellPrice.indexOf(sellPrice[index]) != '-1'}">
				<p class="table-content table-content-price" :data-index="'sell-' + index" @mouseover="hover(index, 'sell', $event)" @mouseleave="leave('sell', $event)">{{ formatSellPrice[index] }}</p>
				<p class="table-content table-content-size" :data-index="'sell-' + index" @mouseover="hover(index, 'sell', $event)" @mouseleave="leave('sell', $event)" :class="{'size-increase': compareSize(index, sellQuote, sameSellPriceQuote, 'increase'), 'size-decrease': compareSize(index, sellQuote, sameSellPriceQuote, 'decrease')}">{{ quote.size }}</p>
				<div class="table-content table-content-total" :data-index="'sell-' + index" @mouseover="hover(index, 'sell', $event)" @mouseleave="leave('sell', $event)">
					{{ sellTotal[index] }}
					<div class="tooltip">
						<p>Avg Price: {{ formatAvgPrice }} USD</p>
						<p>Total Value: {{ formatTotalValue }} USD</p>
					</div>
				</div>
			</div>
		</template>
		<div class="table-last-price-container" :class="{ 'price-no-change': gainNoChange, 'price-up': gainUp, 'price-down': gainDown }">
			<p class="table-last-price">{{lastPrice}}</p>
			<img class="table-arrow" src="../assets/IconArrowDown.svg" alt="arrow">
		</div>
		<template v-for="(quote, index) in buyQuote" :key="quote-index">
			<div class="table-content-row table-content-row-body table-content-row-body-buy" :data-index="'buy-' + index" v-if="index <= 7" :class="{'new-price': differentBuyPrice.indexOf(buyPrice[index]) != '-1'}">
				<p class="table-content table-content-price" :data-index="'buy-' + index" @mouseover="hover(index, 'buy', $event)" @mouseleave="leave('buy', $event)">{{ formatBuyPrice[index] }}</p>
				<p class="table-content table-content-size" :data-index="'buy-' + index" @mouseover="hover(index, 'buy', $event)" @mouseleave="leave('buy', $event)" :class="{'size-increase': compareSize(index, buyQuote, sameBuyPriceQuote, 'increase'), 'size-decrease': compareSize(index, buyQuote, sameBuyPriceQuote, 'decrease')}">{{ quote.size }}</p>
				<div class="table-content table-content-total" :data-index="'buy-' + index" @mouseover="hover(index, 'buy', $event)" @mouseleave="leave('buy', $event)">
					{{ buyTotal[index] }}
					<div class="tooltip">
						<p>Avg Price: {{ formatAvgPrice }} USD</p>
						<p>Total Value: {{ formatTotalValue }} USD</p>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>
<script>
	export default {
		name: 'Table',
		data() {
			return {
				url: '/api/futures/api/v2.1/orderbook/L2',
				apiData: [],
				formatBuyPrice: [],
				formatSellPrice: [],
				timer: '',
				lastPrice: '',
				gainNoChange: false,
				gainUp: false,
				gainDown: false,
				buyQuote: [],
				buyPrice: [],
				buySize: [],
				buyTotal: [],
				sellQuote: [],
				sellPrice: [],
				sellSize: [],
				sellTotal: [],
				formatTotalValue: 0,
				formatAvgPrice: 0,
				oldBuyPrice: [],
				oldSellPrice: [],
				oldSellQuote: [],
				oldBuyQuote: [],
				differentBuyPrice: [],
				differentSellPrice: [],
				sameSellPriceQuote: [],
				sameBuyPriceQuote: [],
			}
		},
		methods: {
			compareSize(index, quote, samePriceQuote, type) {
				let res = false;
				if(samePriceQuote.length > 0) {
					if(quote[index].price == samePriceQuote[index].price) {
						switch(type) {
							case 'increase':
								res = samePriceQuote[index].size > quote[index].size;
								break;
							case 'decrease':
								res = samePriceQuote[index].size < quote[index].size;
								break;
						}
					}
				}
				return res;
			},
			commaFormat(n) {
				return n.toString().replace(/^(-?\d+?)((?:\d{3})+)(?=\.\d+$|$)/, function(all, pre, groupOf3Digital) {
							return pre + groupOf3Digital.replace(/\d{3}/g, ',$&');
						});
			},
			priceListFormat(list) {
				let vm = this;
				let formatPriceList = [];
				list.forEach(n => {
					formatPriceList.push(vm.commaFormat(n.price));
				});
				return formatPriceList;
			},
			hover(index, type, event) {		
				let target = event.target;
				if(!target.classList.contains('tooltip')) {
					let targetParent = target.parentElement;
					let targetSiblings = targetParent.childNodes;
					if(targetSiblings) {
						targetSiblings.forEach(e => {
							e.classList.add('hover');
						});
						targetParent.classList.add('hover');

						if(!targetParent.classList.contains('tooltip')) {
							let targetIndex = targetParent.getAttribute("data-index").split('-')[1];
							switch(type) {
								case 'sell':
									for(let i=7; i>targetIndex; i--) {
										document.querySelector(`[data-index="sell-${i}"]`).classList.add('hover-thorough');
										document.querySelector(`[data-index="sell-${i}"]`).childNodes.forEach(n => {
											if(!n.classList.contains('tooltip')) {
												n.classList.add('hover-thorough');
											}
										});
									}
									break;
								case 'buy':
									for(let i=0; i<targetIndex; i++) {
										document.querySelector(`[data-index="buy-${i}"]`).classList.add('hover-thorough');
										document.querySelector(`[data-index="buy-${i}"]`).childNodes.forEach(n => {
											if(!n.classList.contains('tooltip')) {
												n.classList.add('hover-thorough');
											}
										});
									}
									break;
							}
						}
					}

					let totalValue = 0;
					let avgPrice = 0;
					switch(type) {
						case 'sell':
							for(let i = 7; i>=index; i--) {
								totalValue += parseFloat(this.sellQuote[i].price) * parseFloat(this.sellQuote[i].size);
							}
							avgPrice = totalValue / parseFloat(this.sellTotal[index]);
							break;
						case 'buy':
							for(let i = 0; i<=index; i++) {
								totalValue += parseFloat(this.buyQuote[i].price) * parseFloat(this.buyQuote[i].size);
							}
							avgPrice = totalValue / parseFloat(this.buyTotal[index]);
							break;
					}
					this.formatTotalValue = this.commaFormat(totalValue.toFixed(1));
					this.formatAvgPrice = this.commaFormat(avgPrice.toFixed(1));
				}
			},
			leave(type, event) {
				let target = event.target;

				if(!target.classList.contains('tooltip')) {
					let targetParent = target.parentElement;
					let targetSiblings = targetParent.childNodes;

					if(targetSiblings) {
						targetSiblings.forEach(e => {
							if(e.classList) {
								e.classList.contains('hover') ? e.classList.remove('hover') : '';
							}
						});
						targetParent.classList.contains('hover') ? targetParent.classList.remove('hover') : '';
						
						if(!targetParent.classList.contains('tooltip')) {
							let targetIndex = targetParent.getAttribute("data-index").split('-')[1];
							switch(type) {
								case 'sell':
									for(let i=7; i>targetIndex; i--) {
										document.querySelector(`[data-index="sell-${i}"]`).classList.contains('hover-thorough') ? document.querySelector(`[data-index="sell-${i}"]`).classList.remove('hover-thorough') : '';
										document.querySelector(`[data-index="sell-${i}"]`).childNodes.forEach(n => {
											if(!n.classList.contains('tooltip')) {
												n.classList.contains('hover-thorough') ? n.classList.remove('hover-thorough') : '';
											}
										});
									}
									break;
								case 'buy':
									for(let i=0; i<targetIndex; i++) {
										document.querySelector(`[data-index="buy-${i}"]`).classList.contains('hover-thorough') ? document.querySelector(`[data-index="buy-${i}"]`).classList.remove('hover-thorough') : '';
										document.querySelector(`[data-index="buy-${i}"]`).childNodes.forEach(n => {
											if(!n.classList.contains('tooltip')) {
												n.classList.contains('hover-thorough') ? n.classList.remove('hover-thorough') : '';
											}
										});
									}
									break;
							}
						}
					}
				}
			},
			fetchData() {
				let vm = this;
				vm.axios.get(vm.url).then(res => {
					if(res.status == 200) {
						vm.apiData = res.data;
						vm.lastPrice = res.data.lastPrice;
						vm.formatBuyPrice = vm.priceListFormat(res.data.buyQuote);
						vm.formatSellPrice = vm.priceListFormat(res.data.sellQuote);
						vm.buyQuote = res.data.buyQuote;
						vm.sellQuote = res.data.sellQuote;

						switch(res.data.gain) {
							case 0:
								vm.gainNoChange = true;
								vm.gainUp = false;
								vm.gainDown = false;
								break;
							case 1:
								vm.gainNoChange = false;
								vm.gainUp = true;
								vm.gainDown = false;
								break;
							case -1:
								vm.gainNoChange = false;
								vm.gainUp = false;
								vm.gainDown = true;
								break;
						}

						vm.sellPrice = [];
						vm.buyPrice = [];
						vm.sellQuote.forEach((e, i) => {
							if(i < 8) {
								vm.sellSize.unshift(parseFloat(e.size));
								vm.sellPrice.push(e.price);
							}
						});
						vm.buyQuote.forEach((e, i) => {
							if(i < 8) {
								vm.buySize.push(parseFloat(e.size));
								vm.buyPrice.push(e.price);
							}
						});

						/**
						 * Calculate tooltip total value
						 */
						let sellSum = 0;
						let buySum = 0;
						vm.sellTotal = vm.sellSize.map((sellSum = 0, n => sellSum += n)).reverse();
						vm.buyTotal = vm.buySize.map((buySum = 0, n => buySum += n));

						/**
						 * Check if same price's size changed
						 */
						if(vm.oldSellPrice.length > 0) {
							vm.sameSellPriceQuote = [];
							vm.differentSellPrice = vm.sellPrice.filter(x => !vm.oldSellPrice.includes(x));
							let samePrice = vm.oldSellPrice.filter(x => vm.sellPrice.includes(x));

							vm.sellQuote.forEach((e, i) => {
								samePrice.forEach(p => {
									if(e.price == p) {
										vm.oldSellQuote.forEach(n => {
											if(n.price == p) {
												vm.sameSellPriceQuote.push({price: n.price, size: n.size});
											}
										});
									}
								});
								(!vm.sameSellPriceQuote[i]) ? vm.sameSellPriceQuote.push({price: '', size: ''}) : '';
							});
						}
						if(vm.oldBuyPrice.length > 0) {
							vm.sameBuyPriceQuote = [];
							vm.differentBuyPrice = vm.buyPrice.filter(x => !vm.oldBuyPrice.includes(x));
							let samePrice = vm.oldBuyPrice.filter(x => vm.buyPrice.includes(x));

							vm.buyQuote.forEach((e, i) => {
								samePrice.forEach(p => {
									if(e.price == p) {
										vm.oldBuyQuote.forEach(n => {
											if(n.price == p) {
												vm.sameBuyPriceQuote.push({price: n.price, size: n.size});
											}
										});
									}
								});
								(!vm.sameBuyPriceQuote[i]) ? vm.sameBuyPriceQuote.push({price: '', size: ''}) : '';
							});
						}

						/**
						 * Save data
						 */
						vm.oldSellPrice = [...vm.sellPrice];
						vm.oldBuyPrice = [...vm.buyPrice];
						vm.oldSellQuote = [...vm.sellQuote];
						vm.oldBuyQuote = [...vm.buyQuote];
					}
				}).catch(err => {
					console.log(err);
					return;
				});
			},
			cancelAutoUpdate () {
				clearInterval(this.timer);
			}
		},
		mounted () {
			this.fetchData();
			this.timer = setInterval(this.fetchData, 86400000);
		},
		beforeDestroy() {
			this.cancelAutoUpdate();
		}
	}
</script>

<style scoped lang="scss">
	@mixin flashAni($name, $bgColor, $duration) {
		animation: $name $duration;

		@keyframes #{$name} {
			0% {
				background-color: transparent;
			}
			50% {
				background-color: $bgColor;
			}
			100% {
				background-color: transparent;
			}
		}
	}
	.table {
		margin: 50px auto 0;
		width: 300px;
		height: auto;
		text-align: center;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		align-items: center;

		& .table-title {
			grid-row: 1;
			grid-column: 1/ span 3;
			height: 33px;
		}

		.table-content-row-head .table-head:nth-child(1) {
			grid-row: 2;
			grid-column: 1;
		}
		.table-content-row-head .table-head:nth-child(2) {
			grid-row: 2;
			grid-column: 2;
		}
		.table-content-row-head .table-head:nth-child(3) {
			grid-row: 2;
			grid-column: 3;
		}
		& .table-last-price-container {
			grid-row: 11;
			grid-column: 1/span 3;
			display: flex;
			gap: 5px;
			justify-content: center;
			align-items: center;
			height: 28px;
			cursor: default;

			& .table-last-price {
				font-weight: 700;
			}
			& .table-arrow {
				width: 15px;
				height: 24px;
			}

			&.price-no-change {
				background-color: $bg-color-price-no-change;
				& .table-last-price {
					color: $text-color-default;
				}
				& .table-arrow {
					display: none;
				}
			}
			&.price-up {
				background-color: $bg-color-accum-green;
				& .table-last-price {
				color: $text-color-buy-quote;
				}
				& .table-arrow {
					transform: rotate(180deg);
					filter: invert(54%) sepia(64%) saturate(4424%) hue-rotate(123deg) brightness(94%) contrast(101%);
				}
			}
			&.price-down {
				background-color: $bg-color-accum-red;
				& .table-last-price {
					color: $text-color-sell-quote;
				}
				& .table-arrow {
					filter: invert(60%) sepia(68%) saturate(4863%) hue-rotate(329deg) brightness(107%) contrast(105%);
				}
			}
		}
		.table-content-row-body:nth-child(1) .table-content:nth-child(1) {
			grid-row: 3;
			grid-column: 1;
		}
		.table-content-row-body:nth-child(1) .table-content:nth-child(2) {
			grid-row: 3;
			grid-column: 2;
		}
		.table-content-row-body:nth-child(1) .table-content:nth-child(3) {
			grid-row: 3;
			grid-column: 3;
		}
		.table-content-row-body:nth-child(2) .table-content:nth-child(1) {
			grid-row: 4;
			grid-column: 1;
		}
		.table-content-row-body:nth-child(2) .table-content:nth-child(2) {
			grid-row: 4;
			grid-column: 2;
		}
		.table-content-row-body:nth-child(2) .table-content:nth-child(3) {
			grid-row: 4;
			grid-column: 3;
		}
		& .table-content-row {
			display: contents;

			&.table-content-row-body-sell {
				&.new-price {
					& .table-content {
						@include flashAni(newQuoteSell, $bg-color-flash-red, .3s);
					}
				}
				& .table-content.table-content-price {
					color: $text-color-sell-quote;
				}
			}
			&.table-content-row-body-buy {
				&.new-price {
					& .table-content {
						@include flashAni(newQuoteBuy, $bg-color-flash-green, .3s);	
					}
				}
				& .table-content.table-content-price {
					color: $text-color-buy-quote;
				}
			}
			
			& .table-head {
				color: $text-color-table-head;
				padding: 5px 20px;
			}				
			& .table-content {
				color: $text-color-default;
				padding: 3px 15px;
				cursor: pointer;

				&.table-content-price {
					text-align: left;
				}
				&.table-content-size {
					text-align: right;

					&.size-increase {
						@include flashAni(sizeIncrease, $bg-color-flash-red, .3s);
					}
					&.size-decrease {
						@include flashAni(sizeDecrease, $bg-color-flash-green, .3s);
					}
				}
				&.table-content-total {
					text-align: right;
					position: relative;
				}
				&.hover,
				&.hover-thorough {
					background-color: $bg-color-quote-hover;
				}
			}
			& .tooltip {
				position: absolute;
				bottom: -80%;
				left: 100%;
				background-color: $bg-color-tooltip;
				min-width: 150px;
				width: 200px;
				height: 60px;
				padding: 5px;
				z-index: 2;
				display: none;
				text-align: center;
				border-radius: 5px;
				flex-direction: column;
				gap: 5px;
				justify-content: center;

				&::after {
					content: " ";
					width: 0;
					height: 0;
					border-style: solid;
					border-width: 12px 12.5px 0 12.5px;
					border-color: $bg-color-tooltip transparent transparent transparent;
					position: absolute;
					top: 60%;
					left: -10%;
					transform: rotate(90deg) translate(-50%, -50%);
				}
				& p {
					font-size: 14px;
					font-weight: normal;

					& span {
						font-weight: bold;
					}
				}
			}

			&.hover {
				& .tooltip {
					display: flex;
				}
			}
		}
	}
</style>
