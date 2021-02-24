# 任务二十六：行星与飞船（一）

url: [url](http://ife.baidu.com/2016/task/detail?taskId=26)

demo: [在线演示](https://evls-practices.github.io/IFE/src/2016/26/index.html)
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
	<li>如图（打开查看），创建一个虚拟宇宙，包括一个行星和飞船</li>
	<li>每个飞船由以下部分组成
		<ul>
			<li>动力系统，可以完成飞行和停止飞行两个行为，暂定所有飞船的动力系统飞行速度是一致的，比如每秒20px，飞行过程中会按照一定速率消耗能源（比如每秒减5%）</li>
			<li>能源系统，提供能源，并且在宇宙中通过太阳能充电（比如每秒增加2%，具体速率自定）</li>
			<li>信号接收处理系统，用于接收行星上的信号</li>
			<li>自爆系统，用于自我销毁</li>
		</ul>
	</li>
	<li>每个飞船的能源是有限的，用一个属性来表示能源剩余量，这是一个百分比，表示还剩余多少能源。</li>
	<li>能源耗尽时，飞船会自动停止飞行</li>
	<li>飞船有两个状态：飞行中和停止，飞船的行为会改变这个属性状态</li>
	<li>飞船的自我销毁方法会立即销毁飞船自身</li>

	<li>行星上有一个指挥官（不需要在页面上表现出其形象），指挥官可以通过行星上的信号发射器发布如下命令
		<ul>
			<li>创建一个新的飞船进入轨道，最多可以创建4个飞船，刚被创建的飞船会停留在某一个轨道上静止不动</li>
			<li>命令某个飞船开始飞行，飞行后飞船会围绕行星做环绕运动，需要模拟出这个动画效果</li>
			<li>命令某个飞船停止飞行</li>
			<li>命令某个飞船销毁，销毁后飞船消失、飞船标示可以用于下次新创建的飞船</li>
		</ul>
	</li>

	<li>你需要设计类似如下指令格式的数据格式
		<pre>			{
				id: 1,
				commond: 'stop'
			}
		</pre>
	</li>

	<li>指挥官通过信号发射器发出的命令是通过一种叫做Mediator的介质进行广播</li>
	<li>Mediator是单向传播的，只能从行星发射到宇宙中，在发射过程中，有30%的信息传送失败（丢包）概率，你需要模拟这个丢包率，另外每次信息正常传送的时间需要1秒</li>
	<li>指挥官并不知道自己的指令是不是真的传给了飞船，飞船的状态他是不知道的，他只能通过自己之前的操作来假设飞船当前的状态</li>
	<li>每个飞船通过信号接收器，接受到通过Mediator传达过来的指挥官的广播信号，但因为是广播信号，所以每个飞船能接受到指挥官发出给所有飞船的所有指令，因此需要通过读取信息判断这个指令是不是发给自己的</li>
</ul>

<h3>任务注意事项</h3>
<ul>
	<li>实现功能的同时，请仔细学习JavaScript相关的知识</li>
	<li>相关信息发送、接受等，建议在控制台中输出</li>
	<li>指挥官下达销毁飞船指令后，默认在指挥官那里就已经默认这个飞船已经被销毁，但由于有信息传递丢失的可能性，所以存在实际上飞船未收到销毁指令，而指挥官又创建了新的飞船，造成宇宙中的飞船数量多于创建的4个上限。</li>
	<li>任务说明中的各种数值说明只是参考，可能存在不合理性，可以自行设定</li>
	<li>实现各种功能、模块时，不需要生搬硬套设计模式，但希望你就设计模式相关知识进行学习，并进行合理的借鉴运用</li>
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
			<li>样式实现</li>
			<li>飞船类</li>
			<li>行星及指挥官</li>
			<li>Mediator</li>
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