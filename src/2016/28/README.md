# 任务二十八：行星与飞船（三）

url: [url](http://ife.baidu.com/2016/task/detail?taskId=28)

demo: [在线演示](https://evls-practices.github.io/IFE/src/2016/28/index.html)
<dl>
	<dt>面向人群：</dt>
	<dd>有一定JavaScript基础，希望学习或加强面向对象编程及设计模式相关知识的同学</dd>
	<dt>难度：</dt>
	<dd>中等</dd>
</dl>

<h3>任务目的</h3>
<ul>
	<li>练习JavaScript面向对象设计</li>
	<li>实践一些基础的设计模式</li>
</ul>

<h3>任务描述</h3>
<ul>
	<li>基于任务二十七，我们继续改善</li>
	<li>第二代宇宙飞船系统进步了很多，但是我们依然无法知道飞船的能源消耗情况，可能有的时候我们发出开始飞行的指令，但飞船早就没有能量了，所以我们再次进行升级，这次我们需要增加一个飞船状态的监视系统</li>
	<li>我们为每个飞船增加一个信号发射器，飞船会通过BUS系统定时（比如每秒）广播自己的飞行状态。发送的时候，我们通过已经安装在飞船上的Adapter把状态数据翻译成二进制码形式，把飞船自身标示，飞行状态，能量编码成一个16位的二进制串，前四位用于飞船自身标示，接下来4位表示飞行状态，0010为停止，0001为飞行，1100表示即将销毁，后八位用于记录飞船剩余能源百分比</li>
	<li>行星上有一个信号接收器，用于通过BUS系统接受各个飞船发送过来的信号</li>
	<li>当信号接收器接收到飞船信号后，会把信息传给数据处理中心（DC），数据处理中心依然是调用Adapter模块，把这些二进制数据转为对象格式存储在DC中</li>
	<li>实现一个行星上的监视大屏幕（如图），用来显示所有飞船的飞行状态及能源情况，当数据处理中心飞船数据发生变化时，它会相应在监视器上做出变化</li>
</ul>

<h3>任务注意事项</h3>
<ul>
	<li>实现功能的同时，请仔细学习JavaScript相关的知识</li>
	<li>相关信息发送、接受等，建议在控制台中输出</li>
	<li>实现各种功能、模块时，不需要生搬硬套设计模式，但希望你就设计模式相关知识进行学习，并进行合理的借鉴运用</li>
	<li>任务说明中的各种数值说明只是参考，可能存在不合理性，可以自行设定</li>
	<li>请注意代码风格的整齐、优雅</li>
	<li>代码中含有必要的注释</li>
	<li>允许使用jQuery等库，但不建议使用React、Angular等框架</li>
</ul>

<h3>任务协作建议</h3>
<ul>
	<li>如果是各自工作，可以按以下方式：
		<ul>
			<li>团队集中讨论，明确题目要求，保证队伍各自对题目要求认知一致</li>
			<li>各自完成任务实践</li>
			<li>交叉互相Review其他人的代码，建议每个人至少看一个同组队友的代码</li>
			<li>相互讨论，最后合成一份组内最佳代码进行提交</li>
		</ul>
	</li>
	<li>如果是分工工作（推荐），可以按以下模块切分
		<ul>
			<li>飞船发射器</li>
			<li>Adapter调整</li>
			<li>数据处理中心</li>
			<li>监视大屏幕</li>
		</ul>
	</li>
</ul>

<h3>在线学习参考资料</h3>
<ul>
	<li>JavaScript Design Patterns
	</li><li>4 JavaScript Design Patterns You Should Know
	</li><li>JavaScript Design Patterns
	</li><li>Understanding Design Patterns in JavaScript
	</li><li>在线电子书：Learning JavaScript Design Patterns
	</li><li>JavaScript 设计模式 – 第一部分： 单例模式、组合模式和外观模式
	</li><li>JavaScript 设计模式 – 第二部分： 适配器、装饰者和工厂模式
	</li><li>JavaScript设计模式一：工厂模式和构造器模式
	</li><li>JavaScript 设计模式读书笔记(五)——工厂模式
	</li><li>Alloy JavaScript 设计模式
	</li><li>常用的Javascript设计模式
	</li><li>javascript常见的设计模式举例
	</li><li>前端攻略：javascript 设计模式
</li></ul>
