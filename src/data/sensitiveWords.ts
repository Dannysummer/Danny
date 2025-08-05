// 敏感词汇表
export const sensitiveWords: string[] = [
  // 政治敏感
  '政府', '官员', '领导人', '国家机密', '机密文件', '示威', '游行', '政党', '选举', '政策', '法规',
  '政变', '独裁', '民主', '人权', '腐败', '贪污', '政治犯', '流亡', '叛乱', '革命', '议会', '宪法',
  'government', 'official', 'leader', 'state secret', 'classified document', 'demonstration', 'parade', 'political party', 'election', 'policy', 'regulation',
  'coup', 'dictatorship', 'democracy', 'human rights', 'corruption', 'embezzlement', 'political prisoner', 'exile', 'rebellion', 'revolution', 'parliament', 'constitution',
  
  // 暴力相关
  '暴力', '打架', '斗殴', '杀人', '自杀', '死亡', '伤害', '恐怖', '威胁', '袭击', '枪击', '爆炸', '战争',
  '虐待', '酷刑', '绑架', '抢劫', '纵火', '暴动', '冲突', '内战', '军事行动', '武装分子', '恐怖组织',
  'violence', 'fighting', 'brawling', 'murder', 'suicide', 'death', 'injury', 'terror', 'threat', 'attack', 'shooting', 'explosion', 'war',
  'torture', 'kidnapping', 'robbery', 'arson', 'riot', 'conflict', 'civil war', 'military operation', 'armed group', 'terrorist organization',
  
  // 色情与低俗内容
  '色情', '裸露', '露骨', '性行为', '性爱', 'AV', '成人影片', '色情网站', '一夜情', '约炮', '卖淫', '嫖娼',
  '艳照', '性骚扰', '性侵犯', '性交易', '性伴侣', '脱衣舞', '性器官', '情趣用品', '三级片', '不良内容',
  'pornography', 'nudity', 'explicit', 'sexual behavior', 'sex', 'adult video', 'porn site', 'one-night stand', 'hookup', 'prostitution', 'solicitation',
  'sex photo', 'sexual harassment', 'sexual assault', 'sex trade', 'sexual partner', 'striptease', 'genitalia', 'sex toys', 'adult content',
  
  // 种族与宗教歧视
  '歧视', '种族', '民族', '宗教', '信仰', '邪教', '异端', '迫害', '仇恨言论', '种族主义',
  '种族清洗', '宗教冲突', '宗派主义', '宗教极端主义', '宗教战争', '宗教领袖', '宗教仪式', '宗教信仰',
  'discrimination', 'race', 'ethnicity', 'religion', 'belief', 'cult', 'heresy', 'persecution', 'hate speech', 'racism',
  'ethnic cleansing', 'religious conflict', 'sectarianism', 'religious extremism', 'religious war', 'religious leader', 'religious ritual', 'religious belief',
  
  // 非法活动与犯罪
  '赌博', '毒品', '诈骗', '谣言', '传销', '走私', '偷渡', '洗钱', '黑社会', '敲诈', '勒索',
  '非法集资', '非法移民', '非法入境', '非法拘禁', '非法拘留', '非法逮捕', '非法交易', '非法经营', '非法出版物',
  '黑客', '攻击', '入侵', '隐私泄露', '数据泄露', '个人信息', '侵权', '抄袭', '剽窃',
  'gambling', 'drugs', 'fraud', 'rumor', 'pyramid scheme', 'smuggling', 'illegal immigration', 'money laundering', 'organized crime', 'extortion', 'blackmail',
  'illegal fundraising', 'illegal immigrant', 'illegal entry', 'illegal detention', 'illegal arrest', 'illegal transaction', 'illegal business', 'illegal publication',
  'hacker', 'attack', 'intrusion', 'privacy leak', 'data breach', 'personal information', 'infringement', 'plagiarism', 'theft of intellectual property',
  
  // 健康与医疗敏感
  '疾病', '传染病', '艾滋病', '癌症', '疫苗', '药物滥用', '医闹',
  '精神疾病', '心理健康', '心理治疗', '心理医生', '心理咨询', '传染病爆发', '流行病', '隔离', '卫生',
  'disease', 'infectious disease', 'AIDS', 'cancer', 'vaccine', 'drug abuse', 'medical dispute',
  'mental illness', 'mental health', 'psychotherapy', 'psychologist', 'counseling', 'outbreak', 'epidemic', 'quarantine', 'sanitation',
  
  // 社会问题
  '贫困', '失业', '流浪汉', '家庭暴力', '儿童虐待', '校园霸凌', '网络欺凌',
  '性别歧视', '性别平等', '性别认同', '性别转换', '性别多元', '性别少数群体', 'LGBTQ+', '性别偏见',
  '童工', '压榨', '低薪', '剥削', '人口买卖', '人口贩卖', '器官买卖', '器官移植',
  'poverty', 'unemployment', 'homeless', 'domestic violence', 'child abuse', 'school bullying', 'cyberbullying',
  'gender discrimination', 'gender equality', 'gender identity', 'gender reassignment', 'gender diversity', 'LGBTQ+', 'gender bias',
  'child labor', 'exploitation', 'low wage', 'human trafficking', 'organ trade', 'organ transplant',
  
  // 网络与信息安全
  '网络攻击', '网络安全', '信息泄露', '信息安全', '隐私保护', '版权', '专利', '商标', '知识产权',
  '密码破解', '钓鱼网站', '钓鱼邮件', '病毒', '木马', '勒索软件', '恶意软件', '后门',
  'cyber attack', 'cybersecurity', 'information leak', 'information security', 'privacy protection', 'copyright', 'patent', 'trademark', 'intellectual property',
  'password cracking', 'phishing', 'phishing email', 'virus', 'trojan', 'ransomware', 'malware', 'backdoor',
  
  // 金融与经济
  '内幕交易', '操纵市场', '假币', '伪钞', '非法集资', '金融诈骗', '庞氏骗局', '虚拟货币', '比特币',
  '股票内幕', '财务造假', '洗黑钱', '偷税漏税', '逃税', '避税', '非法筹资',
  'insider trading', 'market manipulation', 'counterfeit money', 'financial fraud', 'ponzi scheme', 'cryptocurrency', 'bitcoin',
  'stock insider', 'financial fraud', 'tax evasion', 'tax avoidance', 'illegal fundraising',
  
  // 网络媒体与传播
  '虚假信息', '假新闻', '谣言', '造谣', '抹黑', '污蔑', '诽谤', '中伤', '抹黑', '舆论操控', '水军',
  '信息操纵', '舆论引导', '媒体控制', '新闻审查', '言论自由', '言论控制', '网络封锁',
  'fake news', 'rumor', 'slander', 'defamation', 'public opinion manipulation', 'internet trolls',
  'information manipulation', 'media control', 'news censorship', 'freedom of speech', 'speech control', 'internet blockade',
  
  // 环境与生态
  '污染', '环境破坏', '生态危机', '气候变化', '全球变暖', '温室效应', '核污染', '核泄漏', '核废料',
  '森林砍伐', '野生动物贸易', '物种灭绝', '濒危物种', '动物虐待', '动物实验',
  'pollution', 'environmental damage', 'ecological crisis', 'climate change', 'global warming', 'greenhouse effect', 'nuclear pollution', 'nuclear leak', 'nuclear waste',
  'deforestation', 'wildlife trade', 'species extinction', 'endangered species', 'animal abuse', 'animal testing',
  
  // 教育相关
  '考试作弊', '论文代写', '学历造假', '证书造假', '学术不端', '抄袭', '剽窃', '学术造假',
  '校园暴力', '校园欺凌', '校园霸凌', '师生关系', '教育资源', '教育不平等',
  'exam cheating', 'ghostwriting', 'fake diploma', 'fake certificate', 'academic misconduct', 'plagiarism', 'academic fraud',
  'campus violence', 'campus bullying', 'teacher-student relationship', 'educational resources', 'educational inequality',
  
  // 娱乐与文化
  '抄袭', '剽窃', '盗版', '山寨', '侵权', '版权侵犯', '文化侵占', '文化挪用',
  '明星丑闻', '娱乐八卦', '负面报道', '私生活', '隐私', '染毒', '酗酒', '丑闻',
  'plagiarism', 'piracy', 'knockoff', 'infringement', 'copyright infringement', 'cultural appropriation',
  'celebrity scandal', 'entertainment gossip', 'negative reporting', 'private life', 'privacy', 'drug abuse', 'alcoholism', 'scandal',
  
  // 食品与健康安全
  '食品安全', '食品添加剂', '地沟油', '食品污染', '过期食品', '农药残留', '激素', '瘦肉精',
  '假药', '劣药', '保健品', '减肥药', '营养补充剂', '药物滥用', '药物成瘾',
  'food safety', 'food additives', 'gutter oil', 'food contamination', 'expired food', 'pesticide residue', 'hormones',
  'fake medicine', 'inferior medicine', 'health products', 'weight loss pills', 'supplements', 'drug abuse', 'drug addiction',
  
  // 其他
  '自残', '伤害', '创伤', '心理阴影', '负面情绪', '压力', '焦虑', '抑郁', '崩溃', '绝望',
  '仇恨', '敌意', '偏执', '妄想', '幻觉', '幻听', '幻视', '疯狂', '失控',
  'self-harm', 'harm', 'trauma', 'psychological shadow', 'negative emotions', 'stress', 'anxiety', 'depression', 'breakdown', 'despair',
  'hatred', 'hostility', 'paranoia', 'delusion', 'hallucination', 'auditory hallucination', 'visual hallucination', 'insanity', 'out of control'
];

/**
 * 检查文本中是否包含敏感词
 * @param text 要检查的文本
 * @returns 包含的第一个敏感词，没有则返回null
 */
export function containsSensitiveWord(text: string): string | null {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  for (const word of sensitiveWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return word;
    }
  }
  
  return null;
}

/**
 * 检查文本中是否包含敏感词并返回所有匹配的敏感词
 * @param text 要检查的文本
 * @returns 所有匹配的敏感词数组
 */
export function findAllSensitiveWords(text: string): string[] {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  return sensitiveWords.filter(word => 
    lowerText.includes(word.toLowerCase())
  );
}

/**
 * 替换文本中的敏感词为指定的替换字符
 * @param text 原始文本
 * @param replacement 替换字符，默认为*
 * @returns 替换敏感词后的文本
 */
export function filterSensitiveWords(text: string, replacement: string = '*'): string {
  if (!text) return text;
  
  let filteredText = text;
  const lowerText = text.toLowerCase();
  
  for (const word of sensitiveWords) {
    const lowerWord = word.toLowerCase();
    if (lowerText.includes(lowerWord)) {
      // 创建与敏感词等长的替换字符串
      const replacementText = replacement.repeat(word.length);
      
      // 使用正则表达式进行全局替换，保持大小写不敏感
      const regex = new RegExp(word, 'gi');
      filteredText = filteredText.replace(regex, replacementText);
    }
  }
  
  return filteredText;
} 