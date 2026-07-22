/**
 * Contextual capitalization: Gospel of Mark.
 * Run: node scripts/apply-mark-capitalization.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const NT_FILE = path.join(__dirname, '..', 'data', 'new-testament-data.json');
const DRY_RUN = process.argv.includes('--dry-run');
const APOS = '\u2019';
const LDQ = '\u201c';
const RDQ = '\u201d';

/** Verse tags where initial "he" is NOT Jesus */
const VERSE_HE_EXCLUDE = new Set([
  'Mark 1|[6]', // John ate - handled separately
  'Mark 1|[7]', // John preached
  'Mark 5|[3]', // demoniac
  'Mark 5|[10]', // demons begged
  'Mark 8|[24]', // blind man looked up
  'Mark 10|[20]', // rich young ruler
  'Mark 14|[15]', // homeowner
  'Mark 15|[46]', // Joseph of Arimathea
]);

/** @type {Array<[string, string, string, string]>} */
const REPLACEMENTS = [
  // Mark 1 — John vs Jesus vs demon vs leper
  ['Mark', 'Mark 1', 'John was clothed with camel' + APOS + 's hair and a leather belt around his waist. He ate locusts and wild honey.  [7] He preached, saying, ' + LDQ + 'After me comes He who is mightier than I', 'John was clothed with camel' + APOS + 's hair and a leather belt around his waist. he ate locusts and wild honey.  [7] he preached, saying, ' + LDQ + 'After me comes He who is mightier than I'],
  ['Mark', 'Mark 1', 'Jesus rebuked Him, saying, ' + LDQ + 'Be quiet, and come out of Him!' + RDQ, 'Jesus rebuked him, saying, ' + LDQ + 'Be quiet, and come out of him!' + RDQ],
  ['Mark', 'Mark 1', 'But He went out, and began to proclaim it much', 'But he went out, and began to proclaim it much'],
  ['Mark', 'Mark 1', 'Immediately coming up from the water, he saw the heavens parting and the Spirit descending on him like a dove.', 'Immediately coming up from the water, He saw the heavens parting and the Spirit descending on Him like a dove.'],
  ['Mark', 'Mark 1', 'Immediately the Spirit drove him out into the wilderness.  [13] he was there in the wilderness forty days', 'Immediately the Spirit drove Him out into the wilderness.  [13] He was there in the wilderness forty days'],
  ['Mark', 'Mark 1', 'and the angels were serving him.', 'and the angels were serving Him.'],
  ['Mark', 'Mark 1', 'Passing along by the sea of Galilee, he saw Simon and Andrew', 'Passing along by the sea of Galilee, He saw Simon and Andrew'],
  ['Mark', 'Mark 1', 'Immediately he called them, and they left their father, Zebedee, in the boat with the hired servants, and went after him.', 'Immediately He called them, and they left their father, Zebedee, in the boat with the hired servants, and went after Him.'],
  ['Mark', 'Mark 1', 'They went into Capernaum, and immediately on the Sabbath day he entered into the synagogue and taught.  [22] They were astonished at his teaching, for he taught them as having authority', 'They went into Capernaum, and immediately on the Sabbath day He entered into the synagogue and taught.  [22] They were astonished at His teaching, for He taught them as having authority'],
  ['Mark', 'Mark 1', 'For with authority he commands even the unclean spirits, and they obey him!' + RDQ + '  [28] The report of him went out immediately', 'For with authority He commands even the unclean spirits, and they obey Him!' + RDQ + '  [28] The report of Him went out immediately'],
  ['Mark', 'Mark 1', 'they told him about her.  [31] he came and took her by the hand', 'they told Him about her.  [31] He came and took her by the hand'],
  ['Mark', 'Mark 1', 'they brought to him all who were sick', 'they brought to Him all who were sick'],
  ['Mark', 'Mark 1', 'he healed many who were sick with various diseases and cast out many demons. he didn' + APOS + 't allow the demons to speak, because they knew him.', 'He healed many who were sick with various diseases and cast out many demons. He didn' + APOS + 't allow the demons to speak, because they knew Him.'],
  ['Mark', 'Mark 1', 'while it was still dark, he rose up and went out', 'while it was still dark, He rose up and went out'],
  ['Mark', 'Mark 1', 'Simon and those who were with him searched for him.  [37] They found him and told him', 'Simon and those who were with him searched for Him.  [37] They found Him and told Him'],
  ['Mark', 'Mark 1', 'A leper came to him, begging him, kneeling down to him, and saying to him', 'A leper came to Him, begging Him, kneeling down to Him, and saying to Him'],
  ['Mark', 'Mark 1', 'Being moved with compassion, he stretched out his hand, and touched him, and said to him', 'Being moved with compassion, He stretched out His hand, and touched him, and said to him'],
  ['Mark', 'Mark 1', 'he strictly warned him and immediately sent him out,  [44] and said to him', 'He strictly warned him and immediately sent him out,  [44] and said to him'],

  // Mark 2 — pilot: His spirit; Levi narrative
  ['Mark', 'Mark 2', 'When he entered again into Capernaum after some days, it was heard that he was at home.', 'When He entered again into Capernaum after some days, it was heard that He was at home.'],
  ['Mark', 'Mark 2', 'and he spoke the word to them.  [3] Four people came, carrying a paralytic to him.  [4] When they could not come near to him for the crowd, they removed the roof where he was.', 'and He spoke the word to them.  [3] Four people came, carrying a paralytic to Him.  [4] When they could not come near to Him for the crowd, they removed the roof where He was.'],
  ['Mark', 'Mark 2', 'As He passed by, He saw Levi the son of Alphaeus sitting at the tax office. He said to Him, ' + LDQ + 'Follow me.' + RDQ + ' And He arose and followed Him.\n     [15] He was reclining at the table in His house, and many tax collectors and sinners sat down with Jesus and His disciples, for there were many, and they followed Him.  [16] The scribes and the Pharisees, when they saw that he was eating with the sinners and tax collectors, said to his disciples, ' + LDQ + 'Why is it that he eats and drinks with tax collectors and sinners?' + RDQ, 'As He passed by, He saw Levi the son of Alphaeus sitting at the tax office, and said to him, ' + LDQ + 'Follow me.' + RDQ + ' And he arose and followed Him.\n     [15] He was reclining at the table in his house, and many tax collectors and sinners sat down with Jesus and His disciples, for there were many, and they followed Him.  [16] The scribes and the Pharisees, when they saw that He was eating with the sinners and tax collectors, said to His disciples, ' + LDQ + 'Why is it that He eats and drinks with tax collectors and sinners?' + RDQ],
  ['Mark', 'Mark 2', 'they came and asked him, ' + LDQ + 'Why do John' + APOS + 's disciples', 'they came and asked Him, ' + LDQ + 'Why do John' + APOS + 's disciples'],
  ['Mark', 'Mark 2', 'he was going on the Sabbath day through the grain fields; and his disciples began', 'He was going on the Sabbath day through the grain fields; and His disciples began'],
  ['Mark', 'Mark 2', 'The Pharisees said to him, ' + LDQ + 'Behold, why do they do that which is not lawful on the Sabbath day?' + RDQ, 'The Pharisees said to Him, ' + LDQ + 'Behold, why do they do that which is not lawful on the Sabbath day?' + RDQ],
  ['Mark', 'Mark 2', 'How He entered into God' + APOS + 's house at the time of Abiathar the high priest, and ate the show bread, which is not lawful to eat except for the priests, and gave also to those who were with Him?' + RDQ, 'How he entered into God' + APOS + 's house at the time of Abiathar the high priest, and ate the show bread, which is not lawful to eat except for the priests, and gave also to those who were with him?' + RDQ],

  // Mark 5 — pilot: demoniac vs Jesus
  ['Mark', 'Mark 5', 'When he had come out of the boat, immediately a man with an unclean spirit met him out of the tombs.', 'When He had come out of the boat, immediately a man with an unclean spirit met Him out of the tombs.'],
  ['Mark', 'Mark 5', 'When He saw Jesus from afar, He ran and bowed down to Him,  [7] and crying out with a loud voice, He said, ' + LDQ + 'What have I to do with you, Jesus, you Son of the Most High God? I adjure you by God, don' + APOS + 't torment me.' + RDQ + '  [8] For he said to him, ' + LDQ + 'Come out of the man, you unclean spirit!' + RDQ, 'When he saw Jesus from afar, he ran and bowed down to Him,  [7] and crying out with a loud voice, he said, ' + LDQ + 'What have I to do with you, Jesus, you Son of the Most High God? I adjure you by God, don' + APOS + 't torment me.' + RDQ + '  [8] For He said to him, ' + LDQ + 'Come out of the man, you unclean spirit!' + RDQ],
  ['Mark', 'Mark 5', 'They came to Jesus, and saw Him who had been possessed by demons sitting, clothed, and in His right mind, even Him who had the legion; and they were afraid.', 'They came to Jesus, and saw him who had been possessed by demons sitting, clothed, and in his right mind, even him who had the legion; and they were afraid.'],
  ['Mark', 'Mark 5', 'They began to beg him to depart from their region.', 'They began to beg Him to depart from their region.'],
  ['Mark', 'Mark 5', 'As he was entering into the boat, he who had been possessed by demons begged him that he might be with him.  [19] He didn' + APOS + 't allow Him, but said to Him, ' + LDQ + 'Go to your house, to your friends, and tell them what great things the Lord has done for you and how He had mercy on you.' + RDQ + '\n     [20] He went His way, and began to proclaim in Decapolis how Jesus had done great things for Him, and everyone marveled.', 'As He was entering into the boat, he who had been possessed by demons begged Him that he might be with Him.  [19] He didn' + APOS + 't allow him, but said to him, ' + LDQ + 'Go to your house, to your friends, and tell them what great things the Lord has done for you and how He had mercy on you.' + RDQ + '\n     [20] He went his way, and began to proclaim in Decapolis how Jesus had done great things for him, and everyone marveled.'],
  ['Mark', 'Mark 5', 'seeing him, he fell at his feet  [23] and begged him much', 'seeing Him, he fell at his feet  [23] and begged Him much'],
  ['Mark', 'Mark 5', 'For she said, ' + LDQ + 'If I just touch his clothes, I will be made well.' + RDQ, 'For she said, ' + LDQ + 'If I just touch His clothes, I will be made well.' + RDQ],
  ['Mark', 'Mark 5', 'his disciples said to him, ' + LDQ + 'You see the multitude pressing against you', 'His disciples said to Him, ' + LDQ + 'You see the multitude pressing against you'],
  ['Mark', 'Mark 5', 'came and fell down before him, and told him all the truth.', 'came and fell down before Him, and told Him all the truth.'],
  ['Mark', 'Mark 5', 'While he was still speaking, people came from the synagogue ruler' + APOS + 's house', 'While He was still speaking, people came from the synagogue ruler' + APOS + 's house'],
  ['Mark', 'Mark 5', 'They ridiculed him. But he, having put them all out', 'They ridiculed Him. But He, having put them all out'],

  // Mark 8 — Peter rebuke; Son of Man
  ['Mark', 'Mark 8', 'his disciples answered him, ' + LDQ + 'From where could one satisfy', 'His disciples answered Him, ' + LDQ + 'From where could one satisfy'],
  ['Mark', 'Mark 8', 'he sighed deeply in his spirit and said, ' + LDQ + 'Why does this generation seek a sign?', 'He sighed deeply in His spirit and said, ' + LDQ + 'Why does this generation seek a sign?'],
  ['Mark', 'Mark 8', 'They told him, ' + LDQ + 'Twelve.' + RDQ, 'They told Him, ' + LDQ + 'Twelve.' + RDQ],
  ['Mark', 'Mark 8', 'They told him, ' + LDQ + 'Seven.' + RDQ, 'They told Him, ' + LDQ + 'Seven.' + RDQ],
  ['Mark', 'Mark 8', 'They brought a blind man to him and begged him to touch him.', 'They brought a blind man to Him and begged Him to touch him.'],
  ['Mark', 'Mark 8', 'he took hold of the blind man by the hand, and brought him out of the village. When he had spat on his eyes, and laid his hands on him, he asked him if he saw anything.', 'He took hold of the blind man by the hand, and brought him out of the village. When He had spat on his eyes, and laid His hands on him, He asked him if he saw anything.'],
  ['Mark', 'Mark 8', 'Then again he laid his hands on his eyes. he looked intently, and was restored, and saw everyone clearly.  [26] he sent him away to his house', 'Then again He laid His hands on his eyes. He looked intently, and was restored, and saw everyone clearly.  [26] He sent him away to his house'],
  ['Mark', 'Mark 8', 'They told him, ' + LDQ + 'John the Baptizer, and others say Elijah', 'They told Him, ' + LDQ + 'John the Baptizer, and others say Elijah'],
  ['Mark', 'Mark 8', 'he commanded them that they should tell no one about him.  [31] He began to teach them', 'He commanded them that they should tell no one about Him.  [31] He began to teach them'],
  ['Mark', 'Mark 8', 'Peter took him and began to rebuke him.', 'Peter took Him and began to rebuke Him.'],
  ['Mark', 'Mark 8', 'he called the multitude to himself with his disciples', 'He called the multitude to Himself with His disciples'],

  // Mark 10 — rich ruler; Bartimaeus; ransom
  ['Mark', 'Mark 10', 'Multitudes came together to him again. As he usually did, he was again teaching them.', 'Multitudes came together to Him again. As He usually did, He was again teaching them.'],
  ['Mark', 'Mark 10', 'Pharisees came to him testing him, and asked him, ' + LDQ + 'Is it lawful for a man to divorce his wife?' + RDQ, 'Pharisees came to Him testing Him, and asked Him, ' + LDQ + 'Is it lawful for a man to divorce his wife?' + RDQ],
  ['Mark', 'Mark 10', 'In the house, his disciples asked him again about the same matter.', 'In the house, His disciples asked Him again about the same matter.'],
  ['Mark', 'Mark 10', 'They were bringing to him little children, that he should touch them', 'They were bringing to Him little children, that He should touch them'],
  ['Mark', 'Mark 10', 'whoever will not receive God' + APOS + 's Kingdom like a little child, He will in no way enter into it.' + RDQ + '  [16] he took them in his arms and blessed them, laying his hands on them.', 'whoever will not receive God' + APOS + 's Kingdom like a little child, he will in no way enter into it.' + RDQ + '  [16] He took them in His arms and blessed them, laying His hands on them.'],
  ['Mark', 'Mark 10', 'one ran to him, knelt before him, and asked him, ' + LDQ + 'Good Teacher', 'one ran to Him, knelt before Him, and asked Him, ' + LDQ + 'Good Teacher'],
  ['Mark', 'Mark 10', 'Jesus said to Him, ' + LDQ + 'Why do you call me good?', 'Jesus said to him, ' + LDQ + 'Why do you call me good?'],
  ['Mark', 'Mark 10', 'Jesus looking at Him loved Him, and said to Him, ' + LDQ + 'One thing you lack', 'Jesus looking at him loved him, and said to him, ' + LDQ + 'One thing you lack'],
  ['Mark', 'Mark 10', 'They will condemn Him to death, and will deliver Him to the Gentiles.   [34] They will mock him, spit on him, scourge him, and kill him. On the third day he will rise again.' + RDQ, 'They will condemn Him to death, and will deliver Him to the Gentiles.   [34] They will mock Him, spit on Him, scourge Him, and kill Him. On the third day He will rise again.' + RDQ],
  ['Mark', 'Mark 10', 'James and John, the sons of Zebedee, came near to him, saying', 'James and John, the sons of Zebedee, came near to Him, saying'],
  ['Mark', 'Mark 10', 'They said to him, ' + LDQ + 'Grant to us that we may sit', 'They said to Him, ' + LDQ + 'Grant to us that we may sit'],
  ['Mark', 'Mark 10', 'When He heard that it was Jesus the Nazarene, He began to cry out and say, ' + LDQ + 'Jesus, you son of David, have mercy on me!' + RDQ + '  [48] Many rebuked him, that he should be quiet, but he cried out much more, ' + LDQ + 'You son of David, have mercy on me!' + RDQ + '\n     [49] Jesus stood still and said, ' + LDQ + 'Call Him.' + RDQ + '\n    They called the blind man, saying to Him, ' + LDQ + 'Cheer up! Get up. He is calling you!' + RDQ + '\n     [50] He, casting away His cloak, sprang up, and came to Jesus.\n     [51] Jesus asked Him, ' + LDQ + 'What do you want me to do for you?' + RDQ + '\n    The blind man said to Him, ' + LDQ + 'Rabboni, that I may see again.' + RDQ + '\n     [52] Jesus said to Him, ' + LDQ + 'Go your way. Your faith has made you well.' + RDQ + '  Immediately He received His sight and followed Jesus on the way.', 'When he heard that it was Jesus the Nazarene, he began to cry out and say, ' + LDQ + 'Jesus, you son of David, have mercy on me!' + RDQ + '  [48] Many rebuked him, that he should be quiet, but he cried out much more, ' + LDQ + 'You son of David, have mercy on me!' + RDQ + '\n     [49] Jesus stood still and said, ' + LDQ + 'Call him.' + RDQ + '\n    They called the blind man, saying to him, ' + LDQ + 'Cheer up! Get up. He is calling you!' + RDQ + '\n     [50] He, casting away his cloak, sprang up, and came to Jesus.\n     [51] Jesus asked him, ' + LDQ + 'What do you want me to do for you?' + RDQ + '\n    The blind man said to him, ' + LDQ + 'Rabboni, that I may see again.' + RDQ + '\n     [52] Jesus said to him, ' + LDQ + 'Go your way. Your faith has made you well.' + RDQ + '  Immediately he received his sight and followed Him on the way.'],

  // Mark 14–16 — passion and resurrection
  ['Mark', 'Mark 14', 'the chief priests and the scribes sought how they might seize him by deception and kill him.', 'the chief priests and the scribes sought how they might seize Him by deception and kill Him.'],
  ['Mark', 'Mark 14', 'While he was at Bethany, in the house of Simon the leper, as he sat at the table, a woman came having an alabaster jar of ointment of pure nard—very costly. She broke the jar and poured it over his head.', 'While He was at Bethany, in the house of Simon the leper, as He sat at the table, a woman came having an alabaster jar of ointment of pure nard—very costly. She broke the jar and poured it over His head.'],
  ['Mark', 'Mark 14', 'that he might deliver him to them.', 'that he might deliver Him to them.'],
  ['Mark', 'Mark 14', 'his disciples asked him, ' + LDQ + 'Where do you want us to go', 'His disciples asked Him, ' + LDQ + 'Where do you want us to go'],
  ['Mark', 'Mark 14', 'he sent two of his disciples and said to them', 'He sent two of His disciples and said to them'],
  ['Mark', 'Mark 14', 'his disciples went out, and came into the city, and found things as he had said to them', 'His disciples went out, and came into the city, and found things as He had said to them'],
  ['Mark', 'Mark 14', 'When it was evening he came with the twelve.', 'When it was evening He came with the twelve.'],
  ['Mark', 'Mark 14', 'They began to be sorrowful, and to ask him one by one', 'They began to be sorrowful, and to ask Him one by one'],
  ['Mark', 'Mark 14', 'he took the cup, and when he had given thanks, he gave to them.', 'He took the cup, and when He had given thanks, He gave to them.'],
  ['Mark', 'Mark 14', 'But Peter said to him, ' + LDQ + 'Although all will be offended, yet I will not.' + RDQ, 'But Peter said to Him, ' + LDQ + 'Although all will be offended, yet I will not.' + RDQ],
  ['Mark', 'Mark 14', 'he said to his disciples, ' + LDQ + 'Sit here while I pray.' + RDQ + '  [33] he took with him Peter, James, and John', 'He said to His disciples, ' + LDQ + 'Sit here while I pray.' + RDQ + '  [33] He took with Him Peter, James, and John'],
  ['Mark', 'Mark 14', 'he went forward a little, and fell on the ground, and prayed that if it were possible, the hour might pass away from him.', 'He went forward a little, and fell on the ground, and prayed that if it were possible, the hour might pass away from Him.'],
  ['Mark', 'Mark 14', 'he came and found them sleeping, and said to Peter', 'He came and found them sleeping, and said to Peter'],
  ['Mark', 'Mark 14', 'Again he went away and prayed, saying the same words.  [40] Again he returned and found them sleeping', 'Again He went away and prayed, saying the same words.  [40] Again He returned and found them sleeping'],
  ['Mark', 'Mark 14', 'Immediately, while he was still speaking, Judas, one of the twelve, came—and with him a multitude', 'Immediately, while He was still speaking, Judas, one of the twelve, came—and with him a multitude'],
  ['Mark', 'Mark 14', 'immediately he came to him and said, ' + LDQ + 'Rabbi! Rabbi!' + RDQ + ' and kissed him.  [46] They laid their hands on him and seized him.', 'immediately he came to Him and said, ' + LDQ + 'Rabbi! Rabbi!' + RDQ + ' and kissed him.  [46] They laid their hands on Him and seized Him.'],
  ['Mark', 'Mark 14', 'They all left him, and fled.', 'They all left Him, and fled.'],
  ['Mark', 'Mark 14', 'Peter had followed him from a distance', 'Peter had followed Him from a distance'],
  ['Mark', 'Mark 14', 'When He thought about that, He wept.', 'When he thought about that, he wept.'],

  ['Mark', 'Mark 15', 'Pilate asked him, ' + LDQ + 'Are you the King of the Jews?' + RDQ + '\n    he answered, ' + LDQ + 'So you say.' + RDQ, 'Pilate asked Him, ' + LDQ + 'Are you the King of the Jews?' + RDQ + '\n    He answered, ' + LDQ + 'So you say.' + RDQ],
  ['Mark', 'Mark 15', 'The chief priests accused him of many things.  [4] Pilate again asked him', 'The chief priests accused Him of many things.  [4] Pilate again asked Him'],
  ['Mark', 'Mark 15', 'For he perceived that for envy the chief priests had delivered him up.', 'For he perceived that for envy the chief priests had delivered Him up.'],
  ['Mark', 'Mark 15', 'The soldiers led him away within the court', 'The soldiers led Him away within the court'],
  ['Mark', 'Mark 15', 'They clothed him with purple; and weaving a crown of thorns, they put it on him.', 'They clothed Him with purple; and weaving a crown of thorns, they put it on Him.'],
  ['Mark', 'Mark 15', 'They began to salute him, ' + LDQ + 'Hail, King of the Jews!' + RDQ, 'They began to salute Him, ' + LDQ + 'Hail, King of the Jews!' + RDQ],
  ['Mark', 'Mark 15', 'They struck his head with a reed and spat on him, and bowing their knees, did homage to him.  [20] When they had mocked him, they took the purple cloak off him, and put his own garments on him. They led him out to crucify him.', 'They struck His head with a reed and spat on Him, and bowing their knees, did homage to Him.  [20] When they had mocked Him, they took the purple cloak off Him, and put His own garments on Him. They led Him out to crucify Him.'],
  ['Mark', 'Mark 15', 'They brought him to the place called Golgotha', 'They brought Him to the place called Golgotha'],
  ['Mark', 'Mark 15', 'They offered him wine mixed with myrrh to drink, but he didn' + APOS + 't take it.\n     [24] Crucifying him, they parted his garments among them', 'They offered Him wine mixed with myrrh to drink, but He didn' + APOS + 't take it.\n     [24] Crucifying Him, they parted His garments among them'],
  ['Mark', 'Mark 15', 'It was the third hour when they crucified him.  [26] The superscription of his accusation was written over him', 'It was the third hour when they crucified Him.  [26] The superscription of His accusation was written over Him'],
  ['Mark', 'Mark 15', 'With him they crucified two robbers, one on his right hand, and one on his left.', 'With Him they crucified two robbers, one on His right hand, and one on His left.'],
  ['Mark', 'Mark 15', 'Those who passed by blasphemed him, wagging their heads and saying', 'Those who passed by blasphemed Him, wagging their heads and saying'],
  ['Mark', 'Mark 15', 'Likewise, also the chief priests mocking among themselves with the scribes said, ' + LDQ + 'he saved others. he can' + APOS + 't save himself.', 'Likewise, also the chief priests mocking among themselves with the scribes said, ' + LDQ + 'He saved others. He can' + APOS + 't save Himself.'],
  ['Mark', 'Mark 15', 'put it on a reed and gave it to him to drink', 'put it on a reed and gave it to Him to drink'],
  ['Mark', 'Mark 15', 'When the centurion, who stood by opposite Him, saw that He cried out like this and breathed His last, He said, ' + LDQ + 'Truly this man was the Son of God!' + RDQ, 'When the centurion, who stood by opposite Him, saw that He cried out like this and breathed His last, he said, ' + LDQ + 'Truly this man was the Son of God!' + RDQ],
  ['Mark', 'Mark 15', 'who, when he was in Galilee, followed him and served him; and many other women who came up with him to Jerusalem.', 'who, when He was in Galilee, followed Him and served Him; and many other women who came up with Him to Jerusalem.'],
  ['Mark', 'Mark 15', 'Joseph of Arimathaea, a prominent council member who also Himself was looking for God' + APOS + 's Kingdom, came.', 'Joseph of Arimathaea, a prominent council member who also himself was looking for God' + APOS + 's Kingdom, came.'],
  ['Mark', 'Mark 15', 'he bought a linen cloth, and taking him down, wound him in the linen cloth and laid him in a tomb which had been cut out of a rock. he rolled a stone against the door of the tomb.  [47] Mary Magdalene and Mary the mother of Joses, saw where he was laid.', 'he bought a linen cloth, and taking Him down, wound Him in the linen cloth and laid Him in a tomb which had been cut out of a rock. He rolled a stone against the door of the tomb.  [47] Mary Magdalene and Mary the mother of Joses, saw where He was laid.'],

  ['Mark', 'Mark 16', 'that they might come and anoint him.', 'that they might come and anoint Him.'],
  ['Mark', 'Mark 16', 'tell His disciples and Peter, \u2018he goes before you into Galilee. There you will see him, as he said to you.\u2019\u201d', 'tell His disciples and Peter, \u2018He goes before you into Galilee. There you will see Him, as He said to you.\u2019\u201d'],
  ['Mark', 'Mark 16', 'Now when he had risen early on the first day of the week, he appeared first to Mary Magdalene, from whom he had cast out seven demons.', 'Now when He had risen early on the first day of the week, He appeared first to Mary Magdalene, from whom He had cast out seven demons.'],
  ['Mark', 'Mark 16', 'She went and told those who had been with him, as they mourned and wept.  [11] When they heard that he was alive and had been seen by her, they disbelieved.', 'She went and told those who had been with Him, as they mourned and wept.  [11] When they heard that He was alive and had been seen by her, they disbelieved.'],
  ['Mark', 'Mark 16', 'After these things he was revealed in another form to two of them', 'After these things He was revealed in another form to two of them'],
  ['Mark', 'Mark 16', 'Afterward he was revealed to the eleven themselves as they sat at the table; and he rebuked them for their unbelief and hardness of heart, because they didn' + APOS + 't believe those who had seen him after he had risen.', 'Afterward He was revealed to the eleven themselves as they sat at the table; and He rebuked them for their unbelief and hardness of heart, because they didn' + APOS + 't believe those who had seen Him after He had risen.'],
];

const JESUS_VERBS =
  'said|went|came|took|looked|asked|answered|called|sent|entered|departed|healed|taught|spoke|saw|left|arose|walked|stood|sat|rose|returned|passed|began|continued|made|gave|received|held|led|followed|warned|rebuked|commanded|perceived|heard|allowed|stretched|touched|moved|sighed|summoned|cast|drove|prayed|cried|wept|ate|drank|fed|broke|blessed|strictly|immediately|was|had|could|would|did|must|will|shall|may|might|can|kept|remained|tried|wanted|needed|forbade|permitted|granted|ordered|directed|instructed|declared|proclaimed|preached|questioned|challenged|tested|refused|accepted|invited|welcomed|raised|lifted|brought|carried|fell|knelt|turned|reached|opened|closed|crossed|calmed|stilled|multiplied|satisfied|anointed|washed|clothed|bound|loosed|released|saved|delivered|judged|condemned|punished|praised|thanked|glorified|suffered|endured|submitted|yielded|obeyed|resisted|overcame|destroyed|struck|awoke|slept|rested|waited|stayed|dwelt|lived|died|breathed|shouted|showed|revealed|hid|approached|withdrew|retreated|advanced|hurried|rushed|paused|stopped|halted|started|resumed|repeated|insisted|finished|completed|fulfilled|set|put|placed|laid|confirmed|denied|acknowledged|confessed|repented|believed|trusted|hoped|feared|grieved|mourned|rejoiced|sang|worshiped|cursed|swore|vowed|promised|pledged|committed|consecrated|ordained|appointed|anointed|commissioned|sent|empowered|strengthened|encouraged|comforted|helped|aided|assisted|served|ministered|worked|labored|struggled|fought|ran|sailed|swam|climbed|fell|slipped|stumbled|recovered|improved|failed|succeeded|obtained|offered|presented|delivered|handed|passed|communicated|proclaimed|announced|declared|stated|affirmed|confirmed|verified|promised|testified|witnessed|showed|revealed|disclosed|exposed|uncovered|discovered|found|located|recognized|realized|understood|comprehended|perceived|discerned|separated|divided|cut|broke|shattered|smashed|crushed|beat|struck|hit|slapped|pushed|pulled|dragged|carried|lifted|lowered|dropped|collapsed|walked|ran|hurried|rushed|slowed|stopped|halted|paused|waited|stayed|remained|continued|proceeded|advanced|retreated|withdrew|departed|left|exited|entered|arrived|reached|approached|neared|turned|rotated|spread|gathered|collected|assembled|kept|retained|maintained|protected|defended|guarded|shielded|covered|fed|prepared|served|ate|drank|tasted|devoured|consumed|swallowed|chewed|bit|sipped|fasted|refrained|avoided|shunned|rejected|refused|declined|denied|forbade|prohibited|punished|paid|returned|restored|replaced|exchanged|traded|negotiated|agreed|consented|complied|adhered|attached|fastened|secured|fixed|landed|disembarked|embarked|boarded|mounted|descended|ascended|climbed|wrote|read|quoted|mentioned|named|identified|recognized|greeted|saluted|welcomed|received|hosted|entertained|fed|nourished|preserved|kept|retained|held|grasped|gripped|seized|grabbed|snatched|caught|surrounded|enclosed|included|united|joined|combined|mixed|stirred|shook|mocked|ridiculed|taunted|insulted|provoked|angered|calmed|soothed|pacified|appeased|reconciled|restored|renewed|revived|resurrected|awakened|aroused|stirred|motivated|inspired|influenced|persuaded|convinced|swayed|touched|affected|changed|converted|transformed|reformed|renewed|regenerated|reborn|revived|restored|healed|made|created|formed|shaped|built|constructed|assembled|prepared|arranged|organized|planned|devised|designed|discovered|found|located|noticed|observed|saw|spotted|gazed|stared|glanced|viewed|beheld|witnessed|experienced|endured|suffered|bore|withstood|resisted|survived|perished|died|expired|departed|breathed|sighed|groaned|screamed|yelled|called|summoned|beckoned|invited|requested|begged|pleaded|prayed|worshiped|adored|honored|respected|loved|enjoyed|admired|praised|extolled|lauded|acclaimed|applauded|cheered|celebrated|honored|glorified|magnified|exalted|lifted|raised|elevated|promoted|advanced|improved|enhanced|blessed|favored|graced|anointed|ordained|appointed|commissioned|dispatched|delegated|authorized|empowered|enabled|equipped|supplied|provided|offered|gave|granted|bestowed|awarded|presented|delivered|handed|passed|communicated|proclaimed|announced|declared|stated|affirmed|confirmed|verified|promised|pledged|vowed|swore|testified|witnessed|showed|revealed|disclosed|exposed|uncovered|discovered|found|located|recognized|realized|understood|comprehended|perceived|discerned|separated|divided|cut|broke|struck|hit|pushed|pulled|dragged|carried|lifted|lowered|dropped|fell|walked|ran|hurried|stopped|halted|paused|waited|stayed|remained|continued|proceeded|advanced|retreated|withdrew|departed|left|entered|arrived|reached|approached|turned|gathered|collected|kept|protected|defended|guarded|fed|prepared|served|ate|drank|refused|declined|denied|forbade|punished|returned|restored|agreed|landed|embarked|disembarked|climbed|descended|ascended|wrote|read|quoted|named|identified|greeted|welcomed|received|hosted|fed|held|seized|grabbed|caught|surrounded|joined|mixed|stirred|shook|mocked|calmed|restored|renewed|revived|awakened|motivated|inspired|persuaded|convinced|moved|touched|changed|converted|transformed|healed|made|built|prepared|planned|found|saw|witnessed|endured|suffered|survived|died|breathed|sighed|called|summoned|invited|asked|begged|prayed|worshiped|honored|loved|praised|glorified|lifted|raised|blessed|anointed|sent|gave|granted|presented|delivered|handed|proclaimed|announced|declared|stated|promised|testified|showed|revealed|found|recognized|understood|perceived|separated|broke|struck|carried|lifted|fell|walked|ran|stopped|waited|stayed|continued|departed|left|entered|arrived|approached|turned|gathered|kept|guarded|fed|served|ate|refused|denied|returned|agreed|climbed|wrote|named|welcomed|received|held|seized|joined|stirred|mocked|restored|revived|awakened|moved|changed|healed|made|built|prepared|found|saw|endured|suffered|died|sighed|called|invited|prayed|honored|praised|glorified|raised|blessed|sent|gave|presented|handed|proclaimed|declared|promised|testified|showed|found|understood|broke|struck|carried|fell|walked|stopped|waited|continued|left|entered|arrived|turned|gathered|kept|fed|served|refused|returned|climbed|wrote|welcomed|received|seized|mocked|restored|moved|healed|found|saw|endured|died|called|prayed|praised|sent|gave|proclaimed|promised|showed|found|carried|fell|walked|waited|continued|left|entered|turned|fed|served|returned|wrote|welcomed|received|mocked|found|saw|died|called|praised|sent|gave|showed|found|fell|walked|left|entered|fed|returned|welcomed|found|saw|called|sent|showed|fell|walked|left|entered|fed|returned|welcomed|found|saw|called|sent|showed';

function applyProgrammaticRules(content, reference) {
  let text = content;

  // Verse-initial he → He (Jesus narrative default in Mark)
  text = text.replace(/(\[\d+\])\s+he\b/g, (match, tag) => {
    const key = `${reference}|${tag}`;
    if (VERSE_HE_EXCLUDE.has(key)) return match;
    return `${tag} He`;
  });

  // Sentence-initial he after period within verse
  text = text.replace(new RegExp(`(\\. )he (${JESUS_VERBS})\\b`, 'g'), '$1He $2');

  // Continuation line he verb (narrative)
  text = text.replace(new RegExp(`(\\n    )he (${JESUS_VERBS})\\b`, 'g'), '$1He $2');

  // Jesus possessives — common in Mark narrative (exclude house: Levi 2:15 handled explicitly)
  const possessives = [
    ['\\bhis disciples\\b', 'His disciples'],
    ['\\bhis teaching\\b', 'His teaching'],
    ['\\bhis spirit\\b', 'His spirit'],
    ['\\bhis name\\b', 'His name'],
    ['\\bhis words\\b', 'His words'],
    ['\\bhis cross\\b', 'His cross'],
    ['\\bhis life\\b', 'His life'],
    ['\\bhis blood\\b', 'His blood'],
    ['\\bhis body\\b', 'His body'],
    ['\\bhis hands\\b', 'His hands'],
    ['\\bhis clothes\\b', 'His clothes'],
    ['\\bhis garment\\b', 'His garment'],
    ['\\bhis garments\\b', 'His garments'],
    ['\\bhis own garments\\b', 'His own garments'],
    ['\\bhis head\\b', 'His head'],
    ['\\bhis boat\\b', 'His boat'],
    ['\\bhis hour\\b', 'His hour'],
    ['\\bhis works\\b', 'His works'],
    ['\\bhis miracles\\b', 'His miracles'],
    ['\\bhis parables\\b', 'His parables'],
  ];
  for (const [from, to] of possessives) {
    text = text.replace(new RegExp(from, 'g'), to);
  }

  return text;
}

function main() {
  const data = JSON.parse(fs.readFileSync(NT_FILE, 'utf8'));
  const book = data.books.find((b) => b.name === 'Mark');
  if (!book) {
    console.error('Mark not found');
    process.exit(1);
  }

  let applied = 0;
  const missed = [];

  for (const [bookName, chapterRef, from, to] of REPLACEMENTS) {
    const chapter = book.chapters.find((c) => c.reference === chapterRef);
    if (!chapter) {
      missed.push(`${chapterRef}: chapter not found`);
      continue;
    }
    if (!chapter.content.includes(from)) {
      missed.push(`${chapterRef}: ${from.slice(0, 50)}...`);
      continue;
    }
    chapter.content = chapter.content.replace(from, to);
    applied++;
  }

  for (const chapter of book.chapters) {
    const before = chapter.content;
    chapter.content = applyProgrammaticRules(chapter.content, chapter.reference);
    if (chapter.content !== before) applied++;
  }

  console.log(`Applied Mark capitalization (${applied} explicit + programmatic passes).`);
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
