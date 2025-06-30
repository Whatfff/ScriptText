// Script Text 语法测试文件
// Script Text Grammar Test File

// 基本对话语句
#[(D1)-(D)]-[Default]<Ann>~: Hello, welcome to the time traveler game! {Action: Speak}

// 询问语句
#[(Q1)-(Q)]-[Default]<Bob>~: What would you like to do? {Action: Ask{QID: 0}}
        -(0)::[(A)-(A)]-[Default]<Player>::<Bob>~: I want to explore the past.
        -(1)::[(A)-(A)]-[Default]<Player>::<Bob>~: I want to explore the future.

// 回复语句
#[(A1)-(A|QID: 0)]-[Default]<CONVERSATION>~:
        +#[(D1)-(D)]-[Default]<Bob>~: Great choice! Let's go to the past.
        +#[(D1)-(D)]-[Default]<Ann>~: I'll prepare the time machine for you.
        #<CONVERSATION> end;

/* 
这是一个多行注释
This is a multi-line comment
*/

// 复杂对话示例
#[(T1)-(T)]-[Default]<System>~: Chapter 1: The Beginning {Action: Display}
#[(D1)-(D)]-[P1]<Narrator>~: The story begins in a mysterious laboratory... {Action: Typewriter}
#[(Q1)-(Q)]-[Default]<Scientist>~: Are you ready for your first time travel? {Action: Ask{QID: 1}}
        -(0)::[(A)-(A)]-[Default]<Player>::<Scientist>~: Yes, I'm ready!
        -(1)::[(A)-(A)]-[Default]<Player>::<Scientist>~: I need more time to think. 