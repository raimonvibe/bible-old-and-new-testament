/**
 * Contextual capitalization: Gospel of Luke.
 * Run: node scripts/apply-luke-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { applyProgrammaticRules } = require('./lib/gospel-capitalization-rules');

const NT_FILE = path.join(__dirname, '..', 'data', 'new-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');
const APOS = '\u2019';
const LDQ = '\u201c';
const RDQ = '\u201d';

/** Verse tags where initial "he" is NOT Jesus */
const VERSE_HE_EXCLUDE = new Set([
  // Luke 1 — Magnificat (God); Zechariah
  'Luke 1|[51]',
  'Luke 1|[52]',
  'Luke 1|[53]',
  'Luke 1|[54]',
  'Luke 1|[63]',

  // Luke 3 — John the Baptist
  'Luke 3|[3]',
  'Luke 3|[7]',
  'Luke 3|[11]',
  'Luke 3|[13]',

  // Luke 6 — parable characters
  'Luke 6|[48]',

  // Luke 7 — raised dead man
  'Luke 7|[15]',

  // Luke 13 — vineyard parable (vine dresser)
  'Luke 13|[7]',
  'Luke 13|[8]',

  // Luke 14 — great supper parable (host)
  'Luke 14|[17]',

  // Luke 15 — prodigal / lost parable characters (not Jesus narrative)
  'Luke 15|[15]',
  'Luke 15|[16]',
  'Luke 15|[26]',
  'Luke 15|[27]',

  // Luke 16 — dishonest manager parable
  'Luke 16|[1]',
  'Luke 16|[2]',
  'Luke 16|[6]',
  'Luke 16|[10]',

  // Luke 19 — Zacchaeus; nobleman parable
  'Luke 19|[4]',
  'Luke 19|[6]',
  'Luke 19|[12]',
  'Luke 19|[13]',
  'Luke 19|[24]',

  // Luke 20 — vineyard parable (landowner / farmers)
  'Luke 20|[9]',
  'Luke 20|[11]',
  'Luke 20|[12]',
  'Luke 20|[16]',

  // Luke 22 — Judas; Passover homeowner; Peter
  'Luke 22|[4]',
  'Luke 22|[6]',
  'Luke 22|[12]',
  'Luke 22|[33]',
  'Luke 22|[62]',

  // Luke 23 — Herod; Joseph of Arimathea
  'Luke 23|[9]',
  'Luke 23|[53]',
]);

/** @type {Array<[string, string, string, string]>} */
const REPLACEMENTS = [
  // Luke 1 — Zechariah vs John (prophecy)
  ['Luke', 'Luke 1', 'Now while He executed the priest' + APOS + 's office before God in the order of His division  [9] according to the custom of the priest' + APOS + 's office, His lot was to enter into the temple of the Lord and burn incense.', 'Now while he executed the priest' + APOS + 's office before God in the order of his division  [9] according to the custom of the priest' + APOS + 's office, his lot was to enter into the temple of the Lord and burn incense.'],
  ['Luke', 'Luke 1', 'An angel of the Lord appeared to Him, standing on the right side of the altar of incense.', 'An angel of the Lord appeared to him, standing on the right side of the altar of incense.'],
  ['Luke', 'Luke 1', 'For He will be great in the sight of the Lord, and He will drink no wine nor strong drink. He will be filled with the Holy Spirit, even from his mother' + APOS + 's womb.  [16] He will turn many of the children of Israel to the Lord their God.  [17] He will go before Him in the spirit and power of Elijah', 'For he will be great in the sight of the Lord, and he will drink no wine nor strong drink. He will be filled with the Holy Spirit, even from his mother' + APOS + 's womb.  [16] He will turn many of the children of Israel to the Lord their God.  [17] He will go before him in the spirit and power of Elijah'],
  ['Luke', 'Luke 1', 'The angel answered Him, ' + LDQ + 'I am Gabriel', 'The angel answered him, ' + LDQ + 'I am Gabriel'],

  // Luke 3 — John the Baptist; baptism
  ['Luke', 'Luke 3', 'and all men reasoned in their hearts concerning John, whether perhaps He was the Christ,  [16] John answered them all', 'and all men reasoned in their hearts concerning John, whether perhaps he was the Christ,  [16] John answered them all'],

  // Luke 4 — temptation; Nazareth; synagogue
  ['Luke', 'Luke 4', 'he ate nothing in those days. Afterward, when they were completed, he was hungry.', 'He ate nothing in those days. Afterward, when they were completed, He was hungry.'],
  ['Luke', 'Luke 4', 'The devil, leading him up on a high mountain, showed him all the kingdoms of the world in a moment of time.  [6] The devil said to him,', 'The devil, leading Him up on a high mountain, showed Him all the kingdoms of the world in a moment of time.  [6] The devil said to Him,'],
  ['Luke', 'Luke 4', 'He led Him to Jerusalem and set Him on the pinnacle of the temple, and said to Him,', 'he led Him to Jerusalem and set Him on the pinnacle of the temple, and said to Him,'],
  ['Luke', 'Luke 4', 'When the devil had completed every temptation, he departed from him until another time.', 'When the devil had completed every temptation, he departed from Him until another time.'],
  ['Luke', 'Luke 4', 'he taught in their synagogues, being glorified by all.\n     [16] he came to Nazareth, where he had been brought up. he entered, as was his custom, into the synagogue on the Sabbath day, and stood up to read.  [17] The book of the prophet Isaiah was handed to him. he opened the book, and found the place where it was written,', 'He taught in their synagogues, being glorified by all.\n     [16] He came to Nazareth, where He had been brought up. He entered, as was His custom, into the synagogue on the Sabbath day, and stood up to read.  [17] The book of the prophet Isaiah was handed to Him. He opened the book, and found the place where it was written,'],
  ['Luke', 'Luke 4', 'he closed the book, gave it back to the attendant, and sat down. The eyes of all in the synagogue were fastened on him.  [21] he began to tell them,', 'He closed the book, gave it back to the attendant, and sat down. The eyes of all in the synagogue were fastened on Him.  [21] He began to tell them,'],
  ['Luke', 'Luke 4', 'he said to them, ' + LDQ + 'Doubtless you will tell me this proverb', 'He said to them, ' + LDQ + 'Doubtless you will tell me this proverb'],
  ['Luke', 'Luke 4', 'he came down to Capernaum, a city of Galilee. he was teaching them on the Sabbath day,  [32] and they were astonished at his teaching, for his word was with authority.', 'He came down to Capernaum, a city of Galilee. He was teaching them on the Sabbath day,  [32] and they were astonished at His teaching, for His word was with authority.'],
  ['Luke', 'Luke 4', 'Jesus rebuked Him, saying, ' + LDQ + 'Be silent and come out of Him!' + RDQ + '  When the demon had thrown Him down in the middle of them, He came out of Him, having done Him no harm.', 'Jesus rebuked him, saying, ' + LDQ + 'Be silent and come out of him!' + RDQ + '  When the demon had thrown him down in the middle of them, he came out of him, having done him no harm.'],
  ['Luke', 'Luke 4', 'For with authority and power he commands the unclean spirits, and they come out!' + RDQ + '  [37] News about him went out into every place of the surrounding region.', 'For with authority and power He commands the unclean spirits, and they come out!' + RDQ + '  [37] News about Him went out into every place of the surrounding region.'],
  ['Luke', 'Luke 4', 'he rose up from the synagogue and entered into Simon' + APOS + 's house. Simon' + APOS + 's mother-in-law was afflicted with a great fever, and they begged him to help her.  [39] he stood over her and rebuked the fever, and it left her. Immediately she rose up and served them.  [40] When the sun was setting, all those who had any sick with various diseases brought them to him; and he laid his hands on every one of them, and healed them.', 'He rose up from the synagogue and entered into Simon' + APOS + 's house. Simon' + APOS + 's mother-in-law was afflicted with a great fever, and they begged Him to help her.  [39] He stood over her and rebuked the fever, and it left her. Immediately she rose up and served them.  [40] When the sun was setting, all those who had any sick with various diseases brought them to Him; and He laid His hands on every one of them, and healed them.'],
  ['Luke', 'Luke 4', 'When it was day, he departed and went into an uninhabited place and the multitudes looked for him, and came to him, and held on to him, so that he wouldn' + APOS + 't go away from them.', 'When it was day, He departed and went into an uninhabited place and the multitudes looked for Him, and came to Him, and held on to Him, so that He wouldn' + APOS + 't go away from them.'],
  ['Luke', 'Luke 4', 'he was preaching in the synagogues of Galilee.', 'He was preaching in the synagogues of Galilee.'],

  // Luke 5 — calling; leper; paralytic; Levi
  ['Luke', 'Luke 5', 'Now while the multitude pressed on Him and heard the word of God, He was standing by the lake of Gennesaret.  [2] he saw two boats standing by the lake, but the fishermen had gone out of them and were washing their nets.  [3] he entered into one of the boats, which was Simon' + APOS + 's, and asked him to put out a little from the land. he sat down and taught the multitudes from the boat.', 'Now while the multitude pressed on Him and heard the word of God, He was standing by the lake of Gennesaret.  [2] He saw two boats standing by the lake, but the fishermen had gone out of them and were washing their nets.  [3] He entered into one of the boats, which was Simon' + APOS + 's, and asked him to put out a little from the land. He sat down and taught the multitudes from the boat.'],
  ['Luke', 'Luke 5', 'When he had finished speaking, he said to Simon,', 'When He had finished speaking, He said to Simon,'],
  ['Luke', 'Luke 5', 'But Simon Peter, when He saw it, fell down at Jesus' + APOS + ' knees, saying,', 'But Simon Peter, when he saw it, fell down at Jesus' + APOS + ' knees, saying,'],
  ['Luke', 'Luke 5', 'When they had brought their boats to land, they left everything, and followed him.', 'When they had brought their boats to land, they left everything, and followed Him.'],
  ['Luke', 'Luke 5', 'While He was in one of the cities, behold, there was a man full of leprosy. When He saw Jesus, He fell on His face and begged Him, saying,', 'While He was in one of the cities, behold, there was a man full of leprosy. When he saw Jesus, he fell on his face and begged Him, saying,'],
  ['Luke', 'Luke 5', 'he stretched out his hand and touched him, saying, ' + LDQ + 'I want to. Be made clean.' + RDQ, 'He stretched out His hand and touched him, saying, ' + LDQ + 'I want to. Be made clean.' + RDQ],
  ['Luke', 'Luke 5', 'he commanded him to tell no one,', 'He commanded him to tell no one,'],
  ['Luke', 'Luke 5', 'But the report concerning him spread much more, and great multitudes came together to hear and to be healed by him of their infirmities.  [16] But he withdrew himself into the desert and prayed.', 'But the report concerning Him spread much more, and great multitudes came together to hear and to be healed by Him of their infirmities.  [16] But He withdrew Himself into the desert and prayed.'],
  ['Luke', 'Luke 5', 'Seeing their faith, he said to him, ' + LDQ + 'Man, your sins are forgiven you.' + RDQ, 'Seeing their faith, He said to him, ' + LDQ + 'Man, your sins are forgiven you.' + RDQ],
  ['Luke', 'Luke 5', 'After these things he went out and saw a tax collector named Levi sitting at the tax office, and said to him, ' + LDQ + 'Follow me!' + RDQ, 'After these things He went out and saw a tax collector named Levi sitting at the tax office, and said to him, ' + LDQ + 'Follow me!' + RDQ],
  ['Luke', 'Luke 5', 'he left everything, and rose up and followed him.  [29] Levi made a great feast for him in his house.', 'he left everything, and rose up and followed Him.  [29] Levi made a great feast for Him in his house.'],
  ['Luke', 'Luke 5', 'They said to him, ' + LDQ + 'Why do John' + APOS + 's disciples often fast', 'They said to Him, ' + LDQ + 'Why do John' + APOS + 's disciples often fast'],
  ['Luke', 'Luke 5', 'he said to them, ' + LDQ + 'Can you make the friends of the bridegroom fast while the bridegroom is with them?', 'He said to them, ' + LDQ + 'Can you make the friends of the bridegroom fast while the bridegroom is with them?'],
  ['Luke', 'Luke 5', 'he also told a parable to them.', 'He also told a parable to them.'],

  // Luke 6 — Sabbath; apostles; sermon
  ['Luke', 'Luke 6', 'Now on the second Sabbath after the first, he was going through the grain fields. his disciples plucked the heads of grain and ate, rubbing them in their hands.', 'Now on the second Sabbath after the first, He was going through the grain fields. His disciples plucked the heads of grain and ate, rubbing them in their hands.'],
  ['Luke', 'Luke 6', 'how He entered into God' + APOS + 's house, and took and ate the show bread, and gave also to those who were with Him, which is not lawful to eat except for the priests alone?' + RDQ, 'how he entered into God' + APOS + 's house, and took and ate the show bread, and gave also to those who were with him, which is not lawful to eat except for the priests alone?' + RDQ],
  ['Luke', 'Luke 6', 'It also happened on another Sabbath that he entered into the synagogue and taught. There was a man there, and his right hand was withered.  [7] The scribes and the Pharisees watched him, to see whether he would heal on the Sabbath, that they might find an accusation against him.  [8] But he knew their thoughts; and he said to the man who had the withered hand, ' + LDQ + 'Rise up and stand in the middle.' + RDQ + ' he arose and stood.  [9] Then Jesus said to them,', 'It also happened on another Sabbath that He entered into the synagogue and taught. There was a man there, and his right hand was withered.  [7] The scribes and the Pharisees watched Him, to see whether He would heal on the Sabbath, that they might find an accusation against Him.  [8] But He knew their thoughts; and He said to the man who had the withered hand, ' + LDQ + 'Rise up and stand in the middle.' + RDQ + ' He arose and stood.  [9] Then Jesus said to them,'],
  ['Luke', 'Luke 6', 'he looked around at them all, and said to the man, ' + LDQ + 'Stretch out your hand.' + RDQ + ' he did, and his hand was restored as sound as the other.', 'He looked around at them all, and said to the man, ' + LDQ + 'Stretch out your hand.' + RDQ + ' He did, and his hand was restored as sound as the other.'],
  ['Luke', 'Luke 6', 'When it was day, he called his disciples, and from them he chose twelve, whom he also named apostles:', 'When it was day, He called His disciples, and from them He chose twelve, whom He also named apostles:'],
  ['Luke', 'Luke 6', 'he came down with them and stood on a level place, with a crowd of his disciples and a great number of the people from all Judea and Jerusalem and the sea coast of Tyre and Sidon, who came to hear him and to be healed of their diseases,  [18] as well as those who were troubled by unclean spirits; and they were being healed.  [19] All the multitude sought to touch him, for power came out of him and healed them all.', 'He came down with them and stood on a level place, with a crowd of His disciples and a great number of the people from all Judea and Jerusalem and the sea coast of Tyre and Sidon, who came to hear Him and to be healed of their diseases,  [18] as well as those who were troubled by unclean spirits; and they were being healed.  [19] All the multitude sought to touch Him, for power came out of Him and healed them all.'],
  ['Luke', 'Luke 6', 'he spoke a parable to them. ' + LDQ + 'Can the blind guide the blind?', 'He spoke a parable to them. ' + LDQ + 'Can the blind guide the blind?'],

  // Luke 7 — centurion; widow; John; sinful woman
  ['Luke', 'Luke 7', 'After he had finished speaking in the hearing of the people, he entered into Capernaum.', 'After He had finished speaking in the hearing of the people, He entered into Capernaum.'],
  ['Luke', 'Luke 7', 'When He heard about Jesus, He sent to Him elders of the Jews, asking Him to come and save His servant.  [4] When they came to Jesus, they begged Him earnestly, saying, ' + LDQ + 'He is worthy for you to do this for Him,  [5] for he loves our nation, and he built our synagogue for us.' + RDQ, 'When he heard about Jesus, he sent to Him elders of the Jews, asking Him to come and save his servant.  [4] When they came to Jesus, they begged Him earnestly, saying, ' + LDQ + 'He is worthy for you to do this for him,  [5] for he loves our nation, and he built our synagogue for us.' + RDQ],
  ['Luke', 'Luke 7', 'When Jesus heard these things, He marveled at Him, and turned and said to the multitude who followed Him,', 'When Jesus heard these things, He marveled at him, and turned and said to the multitude who followed Him,'],
  ['Luke', 'Luke 7', 'Soon afterwards, he went to a city called Nain. Many of his disciples, along with a great multitude, went with him.', 'Soon afterwards, He went to a city called Nain. Many of His disciples, along with a great multitude, went with Him.'],
  ['Luke', 'Luke 7', 'Now when he came near to the gate of the city, behold, one who was dead was carried out,', 'Now when He came near to the gate of the city, behold, one who was dead was carried out,'],
  ['Luke', 'Luke 7', 'he came near and touched the coffin, and the bearers stood still. he said, ' + LDQ + 'Young man, I tell you, arise!' + RDQ, 'He came near and touched the coffin, and the bearers stood still. He said, ' + LDQ + 'Young man, I tell you, arise!' + RDQ],
  ['Luke', 'Luke 7', 'John, calling to Himself two of His disciples, sent them to Jesus, saying,', 'John, calling to himself two of his disciples, sent them to Jesus, saying,'],
  ['Luke', 'Luke 7', 'In that hour he cured many of diseases and plagues and evil spirits; and to many who were blind he gave sight.', 'In that hour He cured many of diseases and plagues and evil spirits; and to many who were blind He gave sight.'],
  ['Luke', 'Luke 7', 'yet He who is least in God' + APOS + 's Kingdom is greater than He.' + RDQ, 'yet he who is least in God' + APOS + 's Kingdom is greater than he.' + RDQ],
  ['Luke', 'Luke 7', 'One of the Pharisees invited him to eat with him. he entered into the Pharisee' + APOS + 's house and sat at the table.', 'One of the Pharisees invited Him to eat with him. He entered into the Pharisee' + APOS + 's house and sat at the table.'],
  ['Luke', 'Luke 7', 'Jesus answered Him, ' + LDQ + 'Simon, I have something to tell you.' + RDQ, 'Jesus answered him, ' + LDQ + 'Simon, I have something to tell you.' + RDQ],
  ['Luke', 'Luke 7', 'he said to him, ' + LDQ + 'You have judged correctly.' + RDQ + '  [44] Turning to the woman, he said to Simon,', 'He said to him, ' + LDQ + 'You have judged correctly.' + RDQ + '  [44] Turning to the woman, He said to Simon,'],
  ['Luke', 'Luke 7', 'he said to her, ' + LDQ + 'Your sins are forgiven.' + RDQ, 'He said to her, ' + LDQ + 'Your sins are forgiven.' + RDQ],
  ['Luke', 'Luke 7', 'he said to the woman, ' + LDQ + 'Your faith has saved you. Go in peace.' + RDQ, 'He said to the woman, ' + LDQ + 'Your faith has saved you. Go in peace.' + RDQ],

  // Luke 8 — sower; storm; demoniac (Mark 5 parallel); Jairus
  ['Luke', 'Luke 8', 'When a great multitude came together and people from every city were coming to him, he spoke by a parable:', 'When a great multitude came together and people from every city were coming to Him, He spoke by a parable:'],
  ['Luke', 'Luke 8', 'As he said these things, he called out, ' + LDQ + 'he who has ears to hear, let him hear!' + RDQ, 'As He said these things, He called out, ' + LDQ + 'he who has ears to hear, let him hear!' + RDQ],
  ['Luke', 'Luke 8', 'Then his disciples asked him, ' + LDQ + 'What does this parable mean?' + RDQ, 'Then His disciples asked Him, ' + LDQ + 'What does this parable mean?' + RDQ],
  ['Luke', 'Luke 8', 'Now on one of those days, he entered into a boat, himself and his disciples, and he said to them,', 'Now on one of those days, He entered into a boat, Himself and His disciples, and He said to them,'],
  ['Luke', 'Luke 8', 'But as they sailed, he fell asleep. A wind storm came down on the lake, and they were taking on dangerous amounts of water.  [24] They came to him and awoke him, saying, ' + LDQ + 'Master, Master, we are dying!' + RDQ + ' he awoke and rebuked the wind and the raging of the water; then they ceased, and it was calm.  [25] he said to them, ' + LDQ + 'Where is your faith?' + RDQ + ' Being afraid, they marveled, saying to one another, ' + LDQ + 'Who is this then, that he commands even the winds and the water, and they obey him?' + RDQ, 'But as they sailed, He fell asleep. A wind storm came down on the lake, and they were taking on dangerous amounts of water.  [24] They came to Him and awoke Him, saying, ' + LDQ + 'Master, Master, we are dying!' + RDQ + ' He awoke and rebuked the wind and the raging of the water; then they ceased, and it was calm.  [25] He said to them, ' + LDQ + 'Where is your faith?' + RDQ + ' Being afraid, they marveled, saying to one another, ' + LDQ + 'Who is this then, that He commands even the winds and the water, and they obey Him?' + RDQ],
  ['Luke', 'Luke 8', 'When Jesus stepped ashore, a certain man out of the city who had demons for a long time met Him. He wore no clothes, and didn' + APOS + 't live in a house, but in the tombs.  [28] When He saw Jesus, He cried out and fell down before Him, and with a loud voice said,', 'When Jesus stepped ashore, a certain man out of the city who had demons for a long time met Him. He wore no clothes, and didn' + APOS + 't live in a house, but in the tombs.  [28] When he saw Jesus, he cried out and fell down before Him, and with a loud voice said,'],
  ['Luke', 'Luke 8', 'He was kept under guard and bound with chains and fetters. Breaking the bonds apart, He was driven by the demon into the desert.', 'He was kept under guard and bound with chains and fetters. Breaking the bonds apart, he was driven by the demon into the desert.'],
  ['Luke', 'Luke 8', 'Jesus asked Him, ' + LDQ + 'What is your name?' + RDQ + '\n    He said, ' + LDQ + 'Legion,' + RDQ + ' for many demons had entered into Him.', 'Jesus asked him, ' + LDQ + 'What is your name?' + RDQ + '\n    He said, ' + LDQ + 'Legion,' + RDQ + ' for many demons had entered into him.'],
  ['Luke', 'Luke 8', 'They begged him that he would not command them to go into the abyss.', 'They begged Him that He would not command them to go into the abyss.'],
  ['Luke', 'Luke 8', 'and they begged him that he would allow them to enter into those. Then he allowed them.', 'and they begged Him that He would allow them to enter into those. Then He allowed them.'],
  ['Luke', 'Luke 8', 'They came to Jesus and found the man from whom the demons had gone out, sitting at Jesus' + APOS + ' feet, clothed and in His right mind; and they were afraid.', 'They came to Jesus and found the man from whom the demons had gone out, sitting at Jesus' + APOS + ' feet, clothed and in his right mind; and they were afraid.'],
  ['Luke', 'Luke 8', 'All the people of the surrounding country of the Gadarenes asked him to depart from them, for they were very much afraid. Then he entered into the boat and returned.', 'All the people of the surrounding country of the Gadarenes asked Him to depart from them, for they were very much afraid. Then He entered into the boat and returned.'],
  ['Luke', 'Luke 8', 'But the man from whom the demons had gone out begged Him that He might go with Him, but Jesus sent Him away, saying,  [39] ' + LDQ + 'Return to your house, and declare what great things God has done for you.' + RDQ + ' He went His way, proclaiming throughout the whole city what great things Jesus had done for Him.', 'But the man from whom the demons had gone out begged Him that he might go with Him, but Jesus sent him away, saying,  [39] ' + LDQ + 'Return to your house, and declare what great things God has done for you.' + RDQ + ' He went his way, proclaiming throughout the whole city what great things Jesus had done for him.'],
  ['Luke', 'Luke 8', 'he said to her, ' + LDQ + 'Daughter, cheer up. Your faith has made you well. Go in peace.' + RDQ, 'He said to her, ' + LDQ + 'Daughter, cheer up. Your faith has made you well. Go in peace.' + RDQ],
  ['Luke', 'Luke 8', 'While he still spoke, one from the ruler of the synagogue' + APOS + 's house came, saying to him,', 'While He still spoke, one from the ruler of the synagogue' + APOS + 's house came, saying to Him,'],
  ['Luke', 'Luke 8', 'When he came to the house, he didn' + APOS + 't allow anyone to enter in, except Peter, John, James, the father of the child, and her mother.  [52] All were weeping and mourning her, but he said, ' + LDQ + 'Don' + APOS + 't weep. She isn' + APOS + 't dead, but sleeping.' + RDQ + '\n     [53] They were ridiculing him, knowing that she was dead.  [54] But he put them all outside, and taking her by the hand, he called, saying, ' + LDQ + 'Child, arise!' + RDQ + '  [55] Her spirit returned, and she rose up immediately. he commanded that something be given to her to eat.  [56] Her parents were amazed, but he commanded them to tell no one what had been done.', 'When He came to the house, He didn' + APOS + 't allow anyone to enter in, except Peter, John, James, the father of the child, and her mother.  [52] All were weeping and mourning her, but He said, ' + LDQ + 'Don' + APOS + 't weep. She isn' + APOS + 't dead, but sleeping.' + RDQ + '\n     [53] They were ridiculing Him, knowing that she was dead.  [54] But He put them all outside, and taking her by the hand, He called, saying, ' + LDQ + 'Child, arise!' + RDQ + '  [55] Her spirit returned, and she rose up immediately. He commanded that something be given to her to eat.  [56] Her parents were amazed, but He commanded them to tell no one what had been done.'],

  // Luke 9 — transfiguration; passion prediction
  ['Luke', 'Luke 9', 'he called the twelve together and gave them power and authority over all demons, and to cure diseases.  [2] He sent them out to preach God' + APOS + 's Kingdom and to heal the sick.  [3] he said to them,', 'He called the twelve together and gave them power and authority over all demons, and to cure diseases.  [2] He sent them out to preach God' + APOS + 's Kingdom and to heal the sick.  [3] He said to them,'],
  ['Luke', 'Luke 9', 'The apostles, when they had returned, told him what things they had done.\n    he took them and withdrew apart to a desert region of a city called Bethsaida.', 'The apostles, when they had returned, told Him what things they had done.\n    He took them and withdrew apart to a desert region of a city called Bethsaida.'],
  ['Luke', 'Luke 9', 'The day began to wear away; and the twelve came and said to him,', 'The day began to wear away; and the twelve came and said to Him,'],
  ['Luke', 'Luke 9', 'But he said to them, ' + LDQ + 'You give them something to eat.' + RDQ, 'But He said to them, ' + LDQ + 'You give them something to eat.' + RDQ],
  ['Luke', 'Luke 9', 'he said to his disciples, ' + LDQ + 'Make them sit down in groups of about fifty each.' + RDQ + '  [15] They did so, and made them all sit down.  [16] he took the five loaves and the two fish, and looking up to the sky, he blessed them, broke them, and gave them to the disciples to set before the multitude.', 'He said to His disciples, ' + LDQ + 'Make them sit down in groups of about fifty each.' + RDQ + '  [15] They did so, and made them all sit down.  [16] He took the five loaves and the two fish, and looking up to the sky, He blessed them, broke them, and gave them to the disciples to set before the multitude.'],
  ['Luke', 'Luke 9', 'As he was praying alone, the disciples were near him, and he asked them, ' + LDQ + 'Who do the multitudes say that I am?' + RDQ, 'As He was praying alone, the disciples were near Him, and He asked them, ' + LDQ + 'Who do the multitudes say that I am?' + RDQ],
  ['Luke', 'Luke 9', 'But he warned them and commanded them to tell this to no one,  [22] saying,', 'But He warned them and commanded them to tell this to no one,  [22] saying,'],
  ['Luke', 'Luke 9', 'he said to all, ' + LDQ + 'If anyone desires to come after me, let him deny himself, take up his cross, and follow me.', 'He said to all, ' + LDQ + 'If anyone desires to come after me, let him deny himself, take up his cross, and follow me.'],
  ['Luke', 'Luke 9', 'About eight days after these sayings, he took with him Peter, John, and James, and went up onto the mountain to pray.  [29] As he was praying, the appearance of his face was altered, and his clothing became white and dazzling.  [30] Behold, two men were talking with him, who were Moses and Elijah,  [31] who appeared in glory and spoke of his departure, which he was about to accomplish at Jerusalem.', 'About eight days after these sayings, He took with Him Peter, John, and James, and went up onto the mountain to pray.  [29] As He was praying, the appearance of His face was altered, and His clothing became white and dazzling.  [30] Behold, two men were talking with Him, who were Moses and Elijah,  [31] who appeared in glory and spoke of His departure, which He was about to accomplish at Jerusalem.'],
  ['Luke', 'Luke 9', 'Now Peter and those who were with him were heavy with sleep, but when they were fully awake, they saw his glory, and the two men who stood with him.', 'Now Peter and those who were with him were heavy with sleep, but when they were fully awake, they saw His glory, and the two men who stood with Him.'],
  ['Luke', 'Luke 9', 'While he said these things, a cloud came and overshadowed them, and they were afraid as they entered into the cloud.  [35] A voice came out of the cloud, saying, ' + LDQ + 'This is my beloved Son. Listen to him!' + RDQ, 'While He said these things, a cloud came and overshadowed them, and they were afraid as they entered into the cloud.  [35] A voice came out of the cloud, saying, ' + LDQ + 'This is my beloved Son. Listen to Him!' + RDQ],
  ['Luke', 'Luke 9', 'On the next day, when they had come down from the mountain, a great multitude met him.', 'On the next day, when they had come down from the mountain, a great multitude met Him.'],
  ['Luke', 'Luke 9', 'While He was still coming, the demon threw Him down and convulsed Him violently. But Jesus rebuked the unclean spirit, healed the boy, and gave Him back to his father.', 'While He was still coming, the demon threw him down and convulsed him violently. But Jesus rebuked the unclean spirit, healed the boy, and gave him back to his father.'],
  ['Luke', 'Luke 9', 'Jesus, perceiving the reasoning of their hearts, took a little child, and set Him by His side,', 'Jesus, perceiving the reasoning of their hearts, took a little child, and set him by His side,'],
  ['Luke', 'Luke 9', 'Jesus said to Him, ' + LDQ + 'Don' + APOS + 't forbid Him, for He who is not against us is for us.' + RDQ, 'Jesus said to him, ' + LDQ + 'Don' + APOS + 't forbid him, for he who is not against us is for us.' + RDQ],
  ['Luke', 'Luke 9', 'It came to pass, when the days were near that he should be taken up, he intently set his face to go to Jerusalem  [52] and sent messengers before his face.', 'It came to pass, when the days were near that He should be taken up, He intently set His face to go to Jerusalem  [52] and sent messengers before His face.'],
  ['Luke', 'Luke 9', 'They didn' + APOS + 't receive him, because he was traveling with his face set toward Jerusalem.', 'They didn' + APOS + 't receive Him, because He was traveling with His face set toward Jerusalem.'],
  ['Luke', 'Luke 9', 'But he turned and rebuked them,', 'But He turned and rebuked them,'],
  ['Luke', 'Luke 9', 'Jesus said to Him, ' + LDQ + 'The foxes have holes and the birds of the sky have nests, but the Son of Man has no place to lay His head.' + RDQ, 'Jesus said to him, ' + LDQ + 'The foxes have holes and the birds of the sky have nests, but the Son of Man has no place to lay His head.' + RDQ],
  ['Luke', 'Luke 9', 'he said to another, ' + LDQ + 'Follow me!' + RDQ, 'He said to another, ' + LDQ + 'Follow me!' + RDQ],
  ['Luke', 'Luke 9', 'But Jesus said to Him, ' + LDQ + 'Leave the dead to bury their own dead, but you go and announce God' + APOS + 's Kingdom.' + RDQ, 'But Jesus said to him, ' + LDQ + 'Leave the dead to bury their own dead, but you go and announce God' + APOS + 's Kingdom.' + RDQ],
  ['Luke', 'Luke 9', 'But Jesus said to Him, ' + LDQ + 'No one, having put His hand to the plow and looking back, is fit for God' + APOS + 's Kingdom.' + RDQ, 'But Jesus said to him, ' + LDQ + 'No one, having put his hand to the plow and looking back, is fit for God' + APOS + 's Kingdom.' + RDQ],

  // Luke 15 — parable intros (Jesus speaks)
  ['Luke', 'Luke 15', 'he told them this parable:  [4] ' + LDQ + 'Which of you men, if you had one hundred sheep', 'He told them this parable:  [4] ' + LDQ + 'Which of you men, if you had one hundred sheep'],
  ['Luke', 'Luke 15', 'he said, ' + LDQ + 'A certain man had two sons.', 'He said, ' + LDQ + 'A certain man had two sons.'],
  ['Luke', 'Luke 15', 'The son said to Him, \u2018Father, I have sinned against heaven and in your sight. I am no longer worthy to be called your son.\u2019', 'The son said to him, \u2018Father, I have sinned against heaven and in your sight. I am no longer worthy to be called your son.\u2019'],

  // Luke 18 — unjust judge and Pharisee parables
  ['Luke', 'Luke 18', 'He wouldn' + APOS + 't for a while; but afterward He said to Himself, ' + LDQ + 'Though I neither fear God nor respect man,', 'He wouldn' + APOS + 't for a while; but afterward he said to himself, ' + LDQ + 'Though I neither fear God nor respect man,'],
  ['Luke', 'Luke 18', 'wouldn' + APOS + 't even lift up His eyes to heaven, but beat His breast, saying, ' + LDQ + 'God, be merciful to me, a sinner!' + RDQ, 'wouldn' + APOS + 't even lift up his eyes to heaven, but beat his breast, saying, ' + LDQ + 'God, be merciful to me, a sinner!' + RDQ],
  ['Luke', 'Luke 18', 'whoever doesn' + APOS + 't receive God' + APOS + 's Kingdom like a little child, He will in no way enter into it.' + RDQ, 'whoever doesn' + APOS + 't receive God' + APOS + 's Kingdom like a little child, he will in no way enter into it.' + RDQ],
  ['Luke', 'Luke 18', 'Jesus asked Him, ' + LDQ + 'Why do you call me good?', 'Jesus asked him, ' + LDQ + 'Why do you call me good?'],

  // Luke 19 — Zacchaeus
  ['Luke', 'Luke 19', 'he entered and was passing through Jericho.  [2] There was a man named Zacchaeus. he was a chief tax collector, and he was rich.  [3] He was trying to see who Jesus was, and couldn' + APOS + 't because of the crowd, because He was short.  [4] he ran on ahead and climbed up into a sycamore tree to see him, for he was going to pass that way.  [5] When Jesus came to the place, He looked up and saw Him, and said to Him, ' + LDQ + 'Zacchaeus, hurry and come down, for today I must stay at your house.' + RDQ + '   [6] he hurried, came down, and received him joyfully.  [7] When they saw it, they all murmured, saying, ' + LDQ + 'he has gone in to lodge with a man who is a sinner.' + RDQ, 'He entered and was passing through Jericho.  [2] There was a man named Zacchaeus. He was a chief tax collector, and he was rich.  [3] He was trying to see who Jesus was, and couldn' + APOS + 't because of the crowd, because he was short.  [4] He ran on ahead and climbed up into a sycamore tree to see Him, for He was going to pass that way.  [5] When Jesus came to the place, He looked up and saw him, and said to him, ' + LDQ + 'Zacchaeus, hurry and come down, for today I must stay at your house.' + RDQ + '   [6] He hurried, came down, and received Him joyfully.  [7] When they saw it, they all murmured, saying, ' + LDQ + 'He has gone in to lodge with a man who is a sinner.' + RDQ],
  ['Luke', 'Luke 19', 'Jesus said to Him, ' + LDQ + 'Today, salvation has come to this house, because He also is a son of Abraham.', 'Jesus said to him, ' + LDQ + 'Today, salvation has come to this house, because he also is a son of Abraham.'],
  ['Luke', 'Luke 19', 'he said therefore, ' + LDQ + 'A certain nobleman went into a far country', 'He said therefore, ' + LDQ + 'A certain nobleman went into a far country'],
  ['Luke', 'Luke 19', 'When he came near to Bethsphage and Bethany, at the mountain that is called Olivet, he sent two of his disciples,  [30] saying,', 'When He came near to Bethsphage and Bethany, at the mountain that is called Olivet, He sent two of His disciples,  [30] saying,'],
  ['Luke', 'Luke 19', 'Those who were sent went away and found things just as he had told them.', 'Those who were sent went away and found things just as He had told them.'],
  ['Luke', 'Luke 19', 'As he went, they spread their cloaks on the road.', 'As He went, they spread their cloaks on the road.'],
  ['Luke', 'Luke 19', 'Some of the Pharisees from the multitude said to him, ' + LDQ + 'Teacher, rebuke your disciples!' + RDQ + '\n     [40] he answered them,', 'Some of the Pharisees from the multitude said to Him, ' + LDQ + 'Teacher, rebuke your disciples!' + RDQ + '\n     [40] He answered them,'],
  ['Luke', 'Luke 19', 'When he came near, he saw the city and wept over it,  [42] saying,', 'When He came near, He saw the city and wept over it,  [42] saying,'],
  ['Luke', 'Luke 19', 'he entered into the temple and began to drive out those who bought and sold in it,  [46] saying to them,', 'He entered into the temple and began to drive out those who bought and sold in it,  [46] saying to them,'],
  ['Luke', 'Luke 19', 'he was teaching daily in the temple, but the chief priests, the scribes, and the leading men among the people sought to destroy him.  [48] They couldn' + APOS + 't find what they might do, for all the people hung on to every word that he said.', 'He was teaching daily in the temple, but the chief priests, the scribes, and the leading men among the people sought to destroy Him.  [48] They couldn' + APOS + 't find what they might do, for all the people hung on to every word that He said.'],

  // Luke 22 — Last Supper; Gethsemane; arrest
  ['Luke', 'Luke 22', 'The chief priests and the scribes sought how they might put him to death, for they feared the people.', 'The chief priests and the scribes sought how they might put Him to death, for they feared the people.'],
  ['Luke', 'Luke 22', 'he went away and talked with the chief priests and captains about how he might deliver him to them.', 'he went away and talked with the chief priests and captains about how he might deliver Him to them.'],
  ['Luke', 'Luke 22', 'They said to him, ' + LDQ + 'Where do you want us to prepare?' + RDQ + '\n     [10] he said to them,', 'They said to Him, ' + LDQ + 'Where do you want us to prepare?' + RDQ + '\n     [10] He said to them,'],
  ['Luke', 'Luke 22', 'When the hour had come, he sat down with the twelve apostles.  [15] he said to them,', 'When the hour had come, He sat down with the twelve apostles.  [15] He said to them,'],
  ['Luke', 'Luke 22', 'he received a cup, and when he had given thanks, he said,', 'He received a cup, and when He had given thanks, He said,'],
  ['Luke', 'Luke 22', 'he took bread, and when he had given thanks, he broke and gave it to them, saying,', 'He took bread, and when He had given thanks, He broke and gave it to them, saying,'],
  ['Luke', 'Luke 22', 'he said to them, ' + LDQ + 'The kings of the nations lord it over them,', 'He said to them, ' + LDQ + 'The kings of the nations lord it over them,'],
  ['Luke', 'Luke 22', 'he said to him, ' + LDQ + 'Lord, I am ready to go with you both to prison and to death!' + RDQ + '\n     [34] he said, ' + LDQ + 'I tell you, Peter, the rooster will by no means crow today until you deny that you know me three times.' + RDQ, 'he said to Him, ' + LDQ + 'Lord, I am ready to go with you both to prison and to death!' + RDQ + '\n     [34] He said, ' + LDQ + 'I tell you, Peter, the rooster will by no means crow today until you deny that you know me three times.' + RDQ],
  ['Luke', 'Luke 22', 'he said to them, ' + LDQ + 'When I sent you out without purse, bag, and sandals, did you lack anything?' + RDQ, 'He said to them, ' + LDQ + 'When I sent you out without purse, bag, and sandals, did you lack anything?' + RDQ],
  ['Luke', 'Luke 22', 'Then he said to them, ' + LDQ + 'But now, whoever has a purse, let him take it,', 'Then He said to them, ' + LDQ + 'But now, whoever has a purse, let him take it,'],
  ['Luke', 'Luke 22', 'he came out and went, as his custom was, to the Mount of Olives. his disciples also followed him.  [40] When he was at the place, he said to them,', 'He came out and went, as His custom was, to the Mount of Olives. His disciples also followed Him.  [40] When He was at the place, He said to them,'],
  ['Luke', 'Luke 22', 'he was withdrawn from them about a stone' + APOS + 's throw, and he knelt down and prayed,  [42] saying,', 'He was withdrawn from them about a stone' + APOS + 's throw, and He knelt down and prayed,  [42] saying,'],
  ['Luke', 'Luke 22', 'An angel from heaven appeared to him, strengthening him.  [44] Being in agony, he prayed more earnestly. his sweat became like great drops of blood falling down on the ground.', 'An angel from heaven appeared to Him, strengthening Him.  [44] Being in agony, He prayed more earnestly. His sweat became like great drops of blood falling down on the ground.'],
  ['Luke', 'Luke 22', 'When he rose up from his prayer, he came to the disciples and found them sleeping because of grief,  [46] and said to them,', 'When He rose up from His prayer, He came to the disciples and found them sleeping because of grief,  [46] and said to them,'],
  ['Luke', 'Luke 22', 'When those who were around him saw what was about to happen, they said to him, ' + LDQ + 'Lord, shall we strike with the sword?' + RDQ, 'When those who were around Him saw what was about to happen, they said to Him, ' + LDQ + 'Lord, shall we strike with the sword?' + RDQ],
  ['Luke', 'Luke 22', 'They seized him and led him away, and brought him into the high priest' + APOS + 's house. But Peter followed from a distance.', 'They seized Him and led Him away, and brought Him into the high priest' + APOS + 's house. But Peter followed from a distance.'],
  ['Luke', 'Luke 22', 'The men who held Jesus mocked Him and beat Him.  [64] Having blindfolded him, they struck him on the face and asked him,', 'The men who held Jesus mocked Him and beat Him.  [64] Having blindfolded Him, they struck Him on the face and asked Him,'],
  ['Luke', 'Luke 22', 'They spoke many other things against him, insulting him.', 'They spoke many other things against Him, insulting Him.'],
  ['Luke', 'Luke 22', 'they led him away into their council, saying,  [67] ' + LDQ + 'If you are the Christ, tell us.' + RDQ, 'they led Him away into their council, saying,  [67] ' + LDQ + 'If you are the Christ, tell us.' + RDQ],

  // Luke 23 — trial; crucifixion; burial
  ['Luke', 'Luke 23', 'The whole company of them rose up and brought him before Pilate.', 'The whole company of them rose up and brought Him before Pilate.'],
  ['Luke', 'Luke 23', 'Pilate asked him, ' + LDQ + 'Are you the King of the Jews?' + RDQ + '\n    he answered him, ' + LDQ + 'So you say.' + RDQ, 'Pilate asked Him, ' + LDQ + 'Are you the King of the Jews?' + RDQ + '\n    He answered him, ' + LDQ + 'So you say.' + RDQ],
  ['Luke', 'Luke 23', 'But they insisted, saying, ' + LDQ + 'he stirs up the people, teaching throughout all Judea, beginning from Galilee even to this place.' + RDQ, 'But they insisted, saying, ' + LDQ + 'He stirs up the people, teaching throughout all Judea, beginning from Galilee even to this place.' + RDQ],
  ['Luke', 'Luke 23', 'Now when Herod saw Jesus, He was exceedingly glad, for He had wanted to see Him for a long time, because He had heard many things about Him. He hoped to see some miracle done by Him.  [9] he questioned him with many words, but he gave no answers.  [10] The chief priests and the scribes stood, vehemently accusing him.  [11] Herod with his soldiers humiliated him and mocked him. Dressing him in luxurious clothing, they sent him back to Pilate.', 'Now when Herod saw Jesus, he was exceedingly glad, for he had wanted to see Him for a long time, because he had heard many things about Him. He hoped to see some miracle done by Him.  [9] He questioned Him with many words, but He gave no answers.  [10] The chief priests and the scribes stood, vehemently accusing Him.  [11] Herod with his soldiers humiliated Him and mocked Him. Dressing Him in luxurious clothing, they sent Him back to Pilate.'],
  ['Luke', 'Luke 23', 'but they shouted, saying, ' + LDQ + 'Crucify! Crucify him!' + RDQ + '\n     [22] he said to them the third time,', 'but they shouted, saying, ' + LDQ + 'Crucify! Crucify Him!' + RDQ + '\n     [22] He said to them the third time,'],
  ['Luke', 'Luke 23', 'A great multitude of the people followed him, including women who also mourned and lamented him.', 'A great multitude of the people followed Him, including women who also mourned and lamented Him.'],
  ['Luke', 'Luke 23', 'When they came to the place that is called ' + LDQ + 'The Skull' + RDQ + ', they crucified him there with the criminals, one on the right and the other on the left.', 'When they came to the place that is called ' + LDQ + 'The Skull' + RDQ + ', they crucified Him there with the criminals, one on the right and the other on the left.'],
  ['Luke', 'Luke 23', 'The soldiers also mocked him, coming to him and offering him vinegar,  [37] and saying, ' + LDQ + 'If you are the King of the Jews, save yourself!' + RDQ, 'The soldiers also mocked Him, coming to Him and offering Him vinegar,  [37] and saying, ' + LDQ + 'If you are the King of the Jews, save yourself!' + RDQ],
  ['Luke', 'Luke 23', 'An inscription was also written over him in letters of Greek, Latin, and Hebrew:', 'An inscription was also written over Him in letters of Greek, Latin, and Hebrew:'],
  ['Luke', 'Luke 23', 'When the centurion saw what was done, He glorified God, saying,', 'When the centurion saw what was done, he glorified God, saying,'],
  ['Luke', 'Luke 23', 'All his acquaintances and the women who followed with him from Galilee stood at a distance, watching these things.', 'All His acquaintances and the women who followed with Him from Galilee stood at a distance, watching these things.'],
  ['Luke', 'Luke 23', 'Joseph, who was a member of the council, a good and righteous man  [51] (He had not consented to their counsel and deed), from Arimathaea, a city of the Jews, who was also waiting for God' + APOS + 's Kingdom.', 'Joseph, who was a member of the council, a good and righteous man  [51] (he had not consented to their counsel and deed), from Arimathaea, a city of the Jews, who was also waiting for God' + APOS + 's Kingdom.'],
  ['Luke', 'Luke 23', 'he took it down and wrapped it in a linen cloth, and laid him in a tomb that was cut in stone, where no one had ever been laid.  [54] It was the day of the Preparation, and the Sabbath was drawing near.  [55] The women who had come with him out of Galilee followed after, and saw the tomb and how his body was laid.', 'He took it down and wrapped it in a linen cloth, and laid Him in a tomb that was cut in stone, where no one had ever been laid.  [54] It was the day of the Preparation, and the Sabbath was drawing near.  [55] The women who had come with Him out of Galilee followed after, and saw the tomb and how His body was laid.'],

  // Luke 24 — resurrection; Emmaus; ascension
  ['Luke', 'Luke 24', 'The men said to them, ' + LDQ + 'Why do you seek the living among the dead?  [6] he isn' + APOS + 't here, but is risen. Remember what he told you when he was still in Galilee,  [7] saying that the Son of Man must be delivered up into the hands of sinful men and be crucified, and the third day rise again?' + RDQ, 'The men said to them, ' + LDQ + 'Why do you seek the living among the dead?  [6] He isn' + APOS + 't here, but is risen. Remember what He told you when He was still in Galilee,  [7] saying that the Son of Man must be delivered up into the hands of sinful men and be crucified, and the third day rise again?' + RDQ],
  ['Luke', 'Luke 24', 'They remembered his words,  [9] returned from the tomb, and told all these things to the eleven and to all the rest.', 'They remembered His words,  [9] returned from the tomb, and told all these things to the eleven and to all the rest.'],
  ['Luke', 'Luke 24', 'he said to them, ' + LDQ + 'What are you talking about as you walk, and are sad?' + RDQ, 'He said to them, ' + LDQ + 'What are you talking about as you walk, and are sad?' + RDQ],
  ['Luke', 'Luke 24', 'he said to them, ' + LDQ + 'Foolish people, and slow of heart to believe in all that the prophets have spoken!', 'He said to them, ' + LDQ + 'Foolish people, and slow of heart to believe in all that the prophets have spoken!'],
  ['Luke', 'Luke 24', 'Beginning from Moses and from all the prophets, he explained to them in all the Scriptures the things concerning himself.', 'Beginning from Moses and from all the prophets, He explained to them in all the Scriptures the things concerning Himself.'],
  ['Luke', 'Luke 24', 'They came near to the village where they were going, and he acted like he would go further.', 'They came near to the village where they were going, and He acted like He would go further.'],
  ['Luke', 'Luke 24', 'he went in to stay with them.  [30] When he had sat down at the table with them, he took the bread and gave thanks. Breaking it, he gave it to them.  [31] Their eyes were opened and they recognized him; then he vanished out of their sight.  [32] They said to one another, ' + LDQ + 'Weren' + APOS + 't our hearts burning within us while he spoke to us along the way, and while he opened the Scriptures to us?' + RDQ, 'He went in to stay with them.  [30] When He had sat down at the table with them, He took the bread and gave thanks. Breaking it, He gave it to them.  [31] Their eyes were opened and they recognized Him; then He vanished out of their sight.  [32] They said to one another, ' + LDQ + 'Weren' + APOS + 't our hearts burning within us while He spoke to us along the way, and while He opened the Scriptures to us?' + RDQ],
  ['Luke', 'Luke 24', 'They related the things that happened along the way, and how he was recognized by them in the breaking of the bread.', 'They related the things that happened along the way, and how He was recognized by them in the breaking of the bread.'],
  ['Luke', 'Luke 24', 'he said to them, ' + LDQ + 'Why are you troubled? Why do doubts arise in your hearts?', 'He said to them, ' + LDQ + 'Why are you troubled? Why do doubts arise in your hearts?'],
  ['Luke', 'Luke 24', 'When he had said this, he showed them his hands and his feet.', 'When He had said this, He showed them His hands and His feet.'],
  ['Luke', 'Luke 24', 'he took them, and ate in front of them.  [44] he said to them,', 'He took them, and ate in front of them.  [44] He said to them,'],
  ['Luke', 'Luke 24', 'Then he opened their minds, that they might understand the Scriptures.', 'Then He opened their minds, that they might understand the Scriptures.'],
  ['Luke', 'Luke 24', 'he led them out as far as Bethany, and he lifted up his hands and blessed them.  [51] While he blessed them, he withdrew from them and was carried up into heaven.  [52] They worshiped him and returned to Jerusalem with great joy,  [53] and were continually in the temple, praising and blessing God. Amen.', 'He led them out as far as Bethany, and He lifted up His hands and blessed them.  [51] While He blessed them, He withdrew from them and was carried up into heaven.  [52] They worshiped Him and returned to Jerusalem with great joy,  [53] and were continually in the temple, praising and blessing God. Amen.'],
];

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  const book = data.books.find((b) => b.name === 'Luke');
  if (!book) {
    console.error('Luke not found');
    process.exit(1);
  }

  let applied = 0;
  const missed = [];

  for (const [, chapterRef, from, to] of REPLACEMENTS) {
    const chapter = book.chapters.find((c) => c.reference === chapterRef);
    if (!chapter) {
      missed.push(`${chapterRef}: chapter not found`);
      continue;
    }
    if (from === to) continue;
    if (!chapter.content.includes(from)) {
      missed.push(`${chapterRef}: ${from.slice(0, 50)}...`);
      continue;
    }
    chapter.content = chapter.content.replace(from, to);
    applied++;
  }

  for (const chapter of book.chapters) {
    const before = chapter.content;
    chapter.content = applyProgrammaticRules(chapter.content, chapter.reference, VERSE_HE_EXCLUDE);
    if (chapter.content !== before) applied++;
  }

  console.log(`Applied Luke capitalization (${applied} explicit + programmatic passes).`);
  if (missed.length) {
    console.warn(`Missed ${missed.length} explicit replacements:`);
    missed.forEach((m) => console.warn(`  - ${m}`));
  }

  if (!DRY_RUN) {
    fs.writeFileSync(NT_FILE, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${NT_FILE}`);
  }
}

main();
