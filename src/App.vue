<template>
	<Table />
</template>

<script>
import Table from './components/Table.vue';

export default {
	name: 'App',
	components: {
		Table,
	}
}
</script>

<style lang="scss">
	* {
		margin: 0;
		padding: 0;
	}
	html {
		background-color: $bg-color;
	}
	html::-webkit-scrollbar,
	body::-webkit-scrollbar {
		display: none;
	}
	#app {
		font-family: "Helvetica Neue", "Helvetica", "Arial", "PingFang TC", "PingFang SC", "Microsoft JhengHei", "Microsoft YaHei", "sans-serif";
		text-align: center;
		color: $text-color-default;
		height: 100vh;
	}
</style>
