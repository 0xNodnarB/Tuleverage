<!DOCTYPE html>
<html>

<head>
  
<style>

body{
	background-color: #f5f5f5;
	font-family: 'Raleway', sans-serif;
}
/*Heading1*/
h1{
	color: #000000;
	font-size: 44px;
	margin-top: 40px;
	text-align: center;
}
/*Button Line*/
.flex-parent {
  display: flex;
}
.jc-center {
  justify-content: center;
}
button.margin-right {
  margin-right: 20px;
}

</style>  

</head>

<body>

<h1>Tuleverage</h1>

<center><img  width="400" height="350" src="https://lh3.googleusercontent.com/drive-viewer/AK7aPaC0qOJPjI88HpkudZQ-S97Y4svt3kQb-YB5WUyGlsPxkXB3QbdcvWV-CGZ92MbXeQX6xS8Q_TNhKUfI4CH8gwvtOMur=s1600"></center>

<div class="flex-parent jc-center" style="margin-top: 20px">
  <button onclick="doSomething()" class="margin-right">Not Danilo</button>
  <button onclick="doSomething2()">Danilo</button>
</div>

<h1 id="verdict"></h1>

<script>
  function doSomething(){
      document.getElementById("verdict").innerHTML = "Do Better";

  }

  function doSomething2(){
      document.getElementById("verdict").innerHTML = "You're a Chad";

  }

</script>

</body>
</html>