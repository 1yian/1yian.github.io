---
layout: default
---

### Publications

<span class='paper-title'>[Stable Remaster: Bridging the Gap Between Old Content and New Displays](https://arxiv.org/abs/2306.06803)</span>\
arXiv preprint 2023 \
Nathan Paull, Shuvam Keshari, **Yian Wong**

<span class='paper-title'>[Exploring Advanced Neural Network Architectures for Synthetic Well Log Generation](https://drive.google.com/file/d/1nhFo2ieQOnIuBwmYC0LpW6dAN5nNuvMk/view?usp=share_link)</span>\
American Rock Mechanics Association Symposium 2022 \
**Yian Wong**, Sau-Wai Wong

<span class='paper-title'>[Using Convolutional Neural Networks and Monte-Carlo Dropout to Generate Synthetic Well Logs with Accurate Uncertainty Estimation](https://rpsonline.com.sg/proceedings/isgsr2022/pdf/08-016.pdf)</span>\
International Symposium for Geotechnical Safety & Risk 2022 \
**Yian Wong**, Sau-Wai Wong

### Personal Projects

<span class='paper-title'>Interpretable Robot Locomotion by Monte Carlo Tree Search and Self-Supervised Learning [[paper]](https://drive.google.com/file/d/1fRZ0oGF6ifNb6KfvyZyG4Yu4IbJo3kL2/view?usp=drive_link)</span>\
*Computer Vision, Reinforcement Learning*\
Our team implemented [MuZero](https://arxiv.org/pdf/1911.08265.pdf) and applied it to the problem of robot locomotion, highlighting the complexity of this control task and the limitations of model-based RL in this domain. We implement a Variational Auto-Encoder to encode pixel observations into a compact latent state. We also proposed potential solutions to enable MuZero to generalize to continuous control tasks in this domain.

<span class='paper-title'>Probabilistic Circuits for Causal Discovery and Model-Based Reinforcement Learning [[paper]](https://drive.google.com/file/d/1RkGMRXwetctpJfo3M2O5pH3Z-8NgD1R8/view?usp=sharing) [[slides]](https://drive.google.com/file/d/1LwvJZ23Lpd6vu9Jq_n9qfhuWVbKCUG0R/view?usp=drive_link) [[talk]](https://drive.google.com/file/d/1pY49JydLrhUZ8MJRJvMlAC35xmzfKuoq/view?usp=sharing)</span>\
*Reinforcement Learning, Causality, Probabilistic Modeling*\
For my class in Causal Reinforcement Learning, I explored Sum Product Networks (SPNs), and their ability to generalize while succinctly exposing internalized causal relationships that were discovered in deep reinforcement learning. I showed that SPNs are comparable to neural networks in reinforcement learning settings, while providing us greatly improved interprability from a causal perspective.

<span class='paper-title'>TwitchMoji [[paper]](https://drive.google.com/file/d/149CHwFuEuTAdsaIBYTaiO_cgisINN7A5/view?usp=drive_link)</span>\
*Natural Language Processing*\
We fine-tuning the BART language model to accurately detect the sentiment. We do this by training it to predict what Twitch emojis were used in Twitch chat messages. By training on billions of chat instances, our fine-tuned BART model is able to better adapt to other sentiment analysis tasks.

<span class='paper-title'>Adversarial Training for Improving Compositional Understanding of Vision-Language Models [[paper]](https://drive.google.com/file/d/1EOF4fVKuT7G_Rm7q0_jxOhUbZ-2dfKOq/view?usp=drive_link)</span>\
*Natural Language Processing*\
In this project, we tackle the problem of grounding natural language. One important benchmark in this field is the [Winoground Challenge](https://arxiv.org/abs/2204.03162), which tasks vision-language models to correctly match similar sentence-image pairs. We propose an adversarial learning adjustments to help improve compositional understanding of the [CLIP model](https://arxiv.org/abs/2103.00020).

<span class='paper-title'>ConnectFourRL [[code]](https://www.github.com/1yian/ConnectFourRL)</span>\
*Computer Vision, Reinforcement Learning*\
I developed an off-policy actor critic algorithm and a residual network for the game of ConnectFour, which was later enhanced with Monte-Carlo Tree Search to enable better decision-making through strategic planning. By playing against itself, the algorithm continually improved its performance. Using my implementation, players can test their skills against the AI and observe its capabilities in various situations.

<span class='paper-title'>Reinforcement Learning in SuperTuxKart [[paper]](https://drive.google.com/file/d/1LBDlhPM4q-CXwGNlE1zybBlL2VP9f4ix/view?usp=drive_link)</span>\
*Computer Vision, Reinforcement Learning*\
Our team implemented asynchronous actor critic with a residual network for the game of SuperTuxKart and identified its sample inefficiency. To address this issue, we proposed an imitation learning framework based on DAgger, demonstrating the ability to accurately imitate expert behavior. Additionally, we explored methods for extrapolating beyond the performance of the expert agent."
